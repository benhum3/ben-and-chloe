import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_DIETARY_LENGTH = 500;

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as {
    guestId?: unknown;
    attending?: unknown;
    dietaryRequirements?: unknown;
  };
  const guestId = typeof body.guestId === "string" ? body.guestId : "";
  const dietaryRequirements =
    typeof body.dietaryRequirements === "string"
      ? body.dietaryRequirements.trim()
      : "";

  if (
    !UUID_PATTERN.test(guestId) ||
    (body.attending !== true &&
      body.attending !== false &&
      body.attending !== null) ||
    dietaryRequirements.length > MAX_DIETARY_LENGTH
  ) {
    return NextResponse.json(
      { error: "Please check the response details." },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("guests")
    .update({
      attending: body.attending,
      dietary_requirements:
        body.attending === true && dietaryRequirements
          ? dietaryRequirements
          : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", guestId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Admin response update failed:", error);
    return NextResponse.json(
      { error: "Unable to update the response." },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Guest not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
