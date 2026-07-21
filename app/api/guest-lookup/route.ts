import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    const trimmedName = name?.trim();

    if (!trimmedName) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 },
      );
    }

    const { data: guest, error: guestError } = await supabaseAdmin
      .from("guests")
      .select(
        `
          id,
          full_name,
          household_id,
          households (
            id,
            invitation_name
          )
        `,
      )
      .ilike("full_name", trimmedName)
      .single();

    if (guestError || !guest) {
      return NextResponse.json(
        { error: "Invitation not found." },
        { status: 404 },
      );
    }

    const household = Array.isArray(guest.households)
      ? guest.households[0]
      : guest.households;

    if (!household) {
      return NextResponse.json(
        { error: "Invitation details could not be found." },
        { status: 404 },
      );
    }

    const { data: guests, error: guestsError } = await supabaseAdmin
      .from("guests")
      .select(
        `
          id,
          household_id,
          full_name,
          attending,
          dietary_requirements,
          created_at,
          updated_at
        `,
      )
      .eq("household_id", guest.household_id)
      .order("created_at", { ascending: true });

    if (guestsError) {
      console.error("Household guest lookup failed:", guestsError);

      return NextResponse.json(
        { error: "We could not load the invitation guests." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      household: {
        id: household.id,
        invitation_name: household.invitation_name,
      },
      guests: guests ?? [],
    });
  } catch (error) {
    console.error("Guest lookup failed:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}