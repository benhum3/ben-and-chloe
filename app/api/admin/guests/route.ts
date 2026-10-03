import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

type InvitationType = "day" | "evening";

type ImportGuest = {
  fullName: string;
  invitationType: InvitationType;
};

type ImportHousehold = {
  invitationName: string;
  invitationType: InvitationType;
  guests: ImportGuest[];
};

type UpdateGuest = {
  id?: string;
  fullName: string;
  invitationType: InvitationType;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isInvitationType(value: unknown): value is InvitationType {
  return value === "day" || value === "evening";
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 401 },
    );
  }

  return null;
}

function normaliseHouseholds(value: unknown): ImportHousehold[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 500) {
    return null;
  }

  const households: ImportHousehold[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") return null;

    const record = item as Record<string, unknown>;
    const invitationName =
      typeof record.invitationName === "string"
        ? record.invitationName.trim()
        : "";
    const guests = Array.isArray(record.guests)
      ? record.guests
          .filter(
            (guest): guest is Record<string, unknown> =>
              Boolean(guest && typeof guest === "object"),
          )
          .map((guest) => ({
            fullName:
              typeof guest.fullName === "string"
                ? guest.fullName.trim()
                : "",
            invitationType: guest.invitationType,
          }))
      : [];
    const invitationType = guests[0]?.invitationType;

    if (
      !invitationName ||
      invitationName.length > 160 ||
      (invitationType !== "day" && invitationType !== "evening") ||
      guests.length === 0 ||
      guests.length > 20 ||
      guests.some(
        (guest) =>
          !guest.fullName ||
          guest.fullName.length > 160 ||
          (guest.invitationType !== "day" &&
            guest.invitationType !== "evening"),
      )
    ) {
      return null;
    }

    households.push({
      invitationName,
      invitationType,
      guests: guests.map((guest) => ({
        fullName: guest.fullName,
        invitationType: guest.invitationType as InvitationType,
      })),
    });
  }

  const names = households.map((household) =>
    household.invitationName.toLowerCase(),
  );

  if (new Set(names).size !== names.length) return null;

  return households;
}

export async function POST(request: Request) {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const body = (await request.json()) as { households?: unknown };
  const households = normaliseHouseholds(body.households);

  if (!households) {
    return NextResponse.json(
      { error: "Please check the household and guest details." },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin.rpc(
    "admin_import_households",
    { payload: households },
  );

  if (error) {
    console.error("Guest import failed:", error);
    return NextResponse.json(
      {
        error: error.message.includes("already exists")
          ? error.message
          : "Unable to import the guest list.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true, imported: data });
}

export async function PATCH(request: Request) {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const body = (await request.json()) as {
    id?: unknown;
    invitationName?: unknown;
    guests?: unknown;
  };

  const id = typeof body.id === "string" ? body.id : "";
  const invitationName =
    typeof body.invitationName === "string"
      ? body.invitationName.trim()
      : "";
  const guests = Array.isArray(body.guests)
    ? body.guests
        .filter((guest): guest is UpdateGuest => {
          if (
            !guest ||
            typeof guest !== "object" ||
            !("fullName" in guest) ||
            typeof guest.fullName !== "string" ||
            !("invitationType" in guest)
          ) {
            return false;
          }

          return isInvitationType(guest.invitationType);
        })
        .map((guest) => ({
          id: typeof guest.id === "string" ? guest.id : undefined,
          fullName: guest.fullName.trim(),
          invitationType: guest.invitationType,
        }))
    : [];

  if (
    !id ||
    !UUID_PATTERN.test(id) ||
    !invitationName ||
    invitationName.length > 160 ||
    guests.length === 0 ||
    guests.length > 20 ||
    guests.some(
      (guest) =>
        !guest.fullName ||
        guest.fullName.length > 160 ||
        Boolean(guest.id && !UUID_PATTERN.test(guest.id)) ||
        (guest.invitationType !== "day" &&
          guest.invitationType !== "evening"),
    )
  ) {
    return NextResponse.json(
      { error: "Please check the household and guest details." },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin.rpc("admin_update_household", {
    payload: { id, invitationName, guests },
  });

  if (error) {
    console.error("Household update failed:", error);
    return NextResponse.json(
      { error: error.message.includes("already exists") ? error.message : "Unable to update the household." },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const body = (await request.json()) as { householdId?: unknown };

  if (
    typeof body.householdId !== "string" ||
    !UUID_PATTERN.test(body.householdId)
  ) {
    return NextResponse.json(
      { error: "Invalid household." },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin.rpc("admin_delete_household", {
    p_household_id: body.householdId,
  });

  if (error) {
    console.error("Household deletion failed:", error);
    return NextResponse.json(
      { error: "Unable to delete the household." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
