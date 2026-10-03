import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

type TableInput = {
  name: string;
  capacity: number;
};

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 401 },
    );
  }

  return null;
}

function normaliseTables(value: unknown): TableInput[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 50) {
    return null;
  }

  const tables = value.map((item) => {
    if (!item || typeof item !== "object") return null;

    const record = item as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const capacity = Number(record.capacity);

    if (
      !name ||
      name.length > 80 ||
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      capacity > 30
    ) {
      return null;
    }

    return { name, capacity };
  });

  if (tables.some((table) => table === null)) return null;

  return tables as TableInput[];
}

export async function GET() {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const [tablesResult, assignmentsResult] = await Promise.all([
    supabaseAdmin
      .from("seating_tables")
      .select("id, name, capacity, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabaseAdmin
      .from("seating_assignments")
      .select("guest_id, table_id"),
  ]);

  if (tablesResult.error || assignmentsResult.error) {
    console.error(
      "Seating plan query failed:",
      tablesResult.error ?? assignmentsResult.error,
    );
    return NextResponse.json(
      { error: "Unable to load the table plan." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    tables: (tablesResult.data ?? []).map((table) => ({
      id: table.id,
      name: table.name,
      capacity: table.capacity,
      sortOrder: table.sort_order,
    })),
    assignments: (assignmentsResult.data ?? []).map((assignment) => ({
      guestId: assignment.guest_id,
      tableId: assignment.table_id,
    })),
  });
}

export async function POST(request: Request) {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const body = (await request.json()) as { tables?: unknown };
  const tables = normaliseTables(body.tables);

  if (!tables) {
    return NextResponse.json(
      { error: "Please provide valid table details." },
      { status: 400 },
    );
  }

  const { data: lastTable, error: orderError } = await supabaseAdmin
    .from("seating_tables")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (orderError) {
    console.error("Seating table order query failed:", orderError);
    return NextResponse.json(
      { error: "Unable to add the table." },
      { status: 500 },
    );
  }

  const startingOrder = (lastTable?.sort_order ?? -1) + 1;
  const { data, error } = await supabaseAdmin
    .from("seating_tables")
    .insert(
      tables.map((table, index) => ({
        name: table.name,
        capacity: table.capacity,
        sort_order: startingOrder + index,
      })),
    )
    .select("id, name, capacity, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Seating table insert failed:", error);
    return NextResponse.json(
      { error: "Unable to add the table." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      tables: (data ?? []).map((table) => ({
        id: table.id,
        name: table.name,
        capacity: table.capacity,
        sortOrder: table.sort_order,
      })),
    },
    { status: 201 },
  );
}

export async function PATCH(request: Request) {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const body = (await request.json()) as Record<string, unknown>;

  if (body.action === "updateTable") {
    const id = typeof body.id === "string" ? body.id : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const capacity = Number(body.capacity);

    if (
      !UUID_PATTERN.test(id) ||
      !name ||
      name.length > 80 ||
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      capacity > 30
    ) {
      return NextResponse.json(
        { error: "Please provide valid table details." },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("seating_tables")
      .update({
        name,
        capacity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, name, capacity, sort_order")
      .single();

    if (error) {
      console.error("Seating table update failed:", error);
      return NextResponse.json(
        { error: "Unable to update the table." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      table: {
        id: data.id,
        name: data.name,
        capacity: data.capacity,
        sortOrder: data.sort_order,
      },
    });
  }

  if (body.action === "assignGuest") {
    const guestId = typeof body.guestId === "string" ? body.guestId : "";
    const tableId = typeof body.tableId === "string" ? body.tableId : null;

    if (
      !UUID_PATTERN.test(guestId) ||
      (tableId !== null && !UUID_PATTERN.test(tableId))
    ) {
      return NextResponse.json(
        { error: "Invalid guest assignment." },
        { status: 400 },
      );
    }

    if (tableId === null) {
      const { error } = await supabaseAdmin
        .from("seating_assignments")
        .delete()
        .eq("guest_id", guestId);

      if (error) {
        console.error("Guest unassignment failed:", error);
        return NextResponse.json(
          { error: "Unable to move the guest." },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true });
    }

    const { data: guest, error: guestError } = await supabaseAdmin
      .from("guests")
      .select("id, invitation_type, attending")
      .eq("id", guestId)
      .single();

    if (
      guestError ||
      guest.attending !== true ||
      guest.invitation_type !== "day"
    ) {
      return NextResponse.json(
        { error: "Only confirmed day guests can be assigned." },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("seating_assignments")
      .upsert(
        {
          guest_id: guestId,
          table_id: tableId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "guest_id" },
      );

    if (error) {
      console.error("Guest assignment failed:", error);
      return NextResponse.json(
        { error: "Unable to move the guest." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: "Invalid seating plan update." },
    { status: 400 },
  );
}

export async function PUT(request: Request) {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const body = (await request.json()) as { assignments?: unknown };
  const assignments = Array.isArray(body.assignments)
    ? body.assignments
    : null;

  if (
    !assignments ||
    assignments.length > 500 ||
    assignments.some((assignment) => {
      if (!assignment || typeof assignment !== "object") return true;
      const record = assignment as Record<string, unknown>;
      return (
        typeof record.guestId !== "string" ||
        !UUID_PATTERN.test(record.guestId) ||
        typeof record.tableId !== "string" ||
        !UUID_PATTERN.test(record.tableId)
      );
    }) ||
    new Set(
      assignments.map(
        (assignment) =>
          (assignment as Record<string, unknown>).guestId,
      ),
    ).size !== assignments.length
  ) {
    return NextResponse.json(
      { error: "Invalid seating plan." },
      { status: 400 },
    );
  }

  const rows = assignments.map((assignment) => {
    const record = assignment as Record<string, string>;
    return {
      guest_id: record.guestId,
      table_id: record.tableId,
      updated_at: new Date().toISOString(),
    };
  });

  if (rows.length > 0) {
    const guestIds = rows.map((row) => row.guest_id);
    const tableIds = Array.from(new Set(rows.map((row) => row.table_id)));
    const [guestsResult, tablesResult] = await Promise.all([
      supabaseAdmin
        .from("guests")
        .select("id, invitation_type, attending")
        .in("id", guestIds),
      supabaseAdmin
        .from("seating_tables")
        .select("id")
        .in("id", tableIds),
    ]);

    if (guestsResult.error || tablesResult.error) {
      console.error(
        "Suggested seating plan validation failed:",
        guestsResult.error ?? tablesResult.error,
      );
      return NextResponse.json(
        { error: "Unable to validate the suggested plan." },
        { status: 500 },
      );
    }

    const guestRows = guestsResult.data ?? [];

    if (
      guestRows.length !== guestIds.length ||
      (tablesResult.data ?? []).length !== tableIds.length ||
      guestRows.some(
        (guest) =>
          guest.attending !== true || guest.invitation_type !== "day",
      )
    ) {
      return NextResponse.json(
        { error: "The plan contains an ineligible guest or table." },
        { status: 400 },
      );
    }

  }

  const { data: currentAssignments, error: currentError } = await supabaseAdmin
    .from("seating_assignments")
    .select("guest_id");

  if (currentError) {
    console.error("Current seating plan query failed:", currentError);
    return NextResponse.json(
      { error: "Unable to save the suggested plan." },
      { status: 500 },
    );
  }

  if (rows.length > 0) {
    const { error: upsertError } = await supabaseAdmin
      .from("seating_assignments")
      .upsert(rows, { onConflict: "guest_id" });

    if (upsertError) {
      console.error("Suggested seating plan upsert failed:", upsertError);
      return NextResponse.json(
        { error: "Unable to save the suggested plan." },
        { status: 500 },
      );
    }
  }

  const suggestedGuestIds = new Set(rows.map((row) => row.guest_id));
  const staleGuestIds = (currentAssignments ?? [])
    .map((assignment) => assignment.guest_id)
    .filter((guestId) => !suggestedGuestIds.has(guestId));

  if (staleGuestIds.length > 0) {
    const { error: deleteError } = await supabaseAdmin
      .from("seating_assignments")
      .delete()
      .in("guest_id", staleGuestIds);

    if (deleteError) {
      console.error("Stale seating assignment deletion failed:", deleteError);
      return NextResponse.json(
        { error: "Unable to finish saving the suggested plan." },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const body = (await request.json()) as { tableId?: unknown };

  if (
    typeof body.tableId !== "string" ||
    !UUID_PATTERN.test(body.tableId)
  ) {
    return NextResponse.json(
      { error: "Invalid table." },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin
    .from("seating_tables")
    .delete()
    .eq("id", body.tableId);

  if (error) {
    console.error("Seating table deletion failed:", error);
    return NextResponse.json(
      { error: "Unable to delete the table." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
