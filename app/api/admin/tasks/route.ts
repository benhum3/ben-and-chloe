import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const taskCategories = [
  "General",
  "Venue",
  "Guests",
  "Suppliers",
  "Stationery",
  "Outfits",
] as const;

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 401 },
    );
  }

  return null;
}

export async function GET() {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const { data, error } = await supabaseAdmin
    .from("planning_tasks")
    .select("id, title, category, due_date, notes, completed, created_at")
    .order("completed", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Planning task query failed:", error);
    return NextResponse.json(
      { error: "Unable to load planning tasks." },
      { status: 500 },
    );
  }

  return NextResponse.json({ tasks: data ?? [] });
}

export async function POST(request: Request) {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const body = (await request.json()) as {
    title?: unknown;
    category?: unknown;
    dueDate?: unknown;
    notes?: unknown;
  };

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const category =
    typeof body.category === "string" &&
    taskCategories.includes(body.category as (typeof taskCategories)[number])
      ? body.category
      : "General";
  const dueDate =
    typeof body.dueDate === "string" && body.dueDate.length > 0
      ? body.dueDate
      : null;
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

  if (!title || title.length > 160 || notes.length > 1000) {
    return NextResponse.json(
      { error: "Please provide a valid task." },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("planning_tasks")
    .insert({ title, category, due_date: dueDate, notes })
    .select("id, title, category, due_date, notes, completed, created_at")
    .single();

  if (error) {
    console.error("Planning task insert failed:", error);
    return NextResponse.json(
      { error: "Unable to add the task." },
      { status: 500 },
    );
  }

  return NextResponse.json({ task: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const body = (await request.json()) as {
    id?: unknown;
    completed?: unknown;
  };

  if (typeof body.id !== "string" || typeof body.completed !== "boolean") {
    return NextResponse.json(
      { error: "Invalid task update." },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("planning_tasks")
    .update({ completed: body.completed, updated_at: new Date().toISOString() })
    .eq("id", body.id)
    .select("id, title, category, due_date, notes, completed, created_at")
    .single();

  if (error) {
    console.error("Planning task update failed:", error);
    return NextResponse.json(
      { error: "Unable to update the task." },
      { status: 500 },
    );
  }

  return NextResponse.json({ task: data });
}

export async function DELETE(request: Request) {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const body = (await request.json()) as { id?: unknown };

  if (typeof body.id !== "string") {
    return NextResponse.json(
      { error: "Invalid task." },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin
    .from("planning_tasks")
    .delete()
    .eq("id", body.id);

  if (error) {
    console.error("Planning task deletion failed:", error);
    return NextResponse.json(
      { error: "Unable to delete the task." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
