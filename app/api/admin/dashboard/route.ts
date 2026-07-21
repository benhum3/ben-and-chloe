import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      { data: households, error: householdsError },
      { data: guests, error: guestsError },
    ] = await Promise.all([
      supabaseAdmin
        .from("households")
        .select(
          `
            id,
            invitation_name,
            song_request,
            message,
            submitted_at,
            updated_at
          `,
        )
        .order("submitted_at", {
          ascending: false,
          nullsFirst: false,
        }),

      supabaseAdmin
        .from("guests")
        .select(
          `
            id,
            household_id,
            full_name,
            attending,
            dietary_requirements,
            updated_at
          `,
        )
        .order("full_name", { ascending: true }),
    ]);

    if (householdsError) {
      console.error("Dashboard household query failed:", householdsError);

      return NextResponse.json(
        { error: "Unable to load household data." },
        { status: 500 },
      );
    }

    if (guestsError) {
      console.error("Dashboard guest query failed:", guestsError);

      return NextResponse.json(
        { error: "Unable to load guest data." },
        { status: 500 },
      );
    }

    const householdRows = households ?? [];
    const guestRows = guests ?? [];

    const attending = guestRows.filter(
      (guest) => guest.attending === true,
    ).length;

    const declined = guestRows.filter(
      (guest) => guest.attending === false,
    ).length;

    const pending = guestRows.filter(
      (guest) => guest.attending === null,
    ).length;

    const householdsResponded = householdRows.filter(
      (household) => household.submitted_at !== null,
    ).length;

    const latestResponses = householdRows
      .filter((household) => household.submitted_at !== null)
      .slice(0, 8)
      .map((household) => {
        const householdGuests = guestRows.filter(
          (guest) => guest.household_id === household.id,
        );

        return {
          id: household.id,
          invitationName: household.invitation_name,
          submittedAt: household.submitted_at,
          attending: householdGuests.filter(
            (guest) => guest.attending === true,
          ).length,
          declined: householdGuests.filter(
            (guest) => guest.attending === false,
          ).length,
        };
      });

    return NextResponse.json({
      stats: {
        totalGuests: guestRows.length,
        attending,
        declined,
        pending,
        totalHouseholds: householdRows.length,
        householdsResponded,
        householdsPending:
          householdRows.length - householdsResponded,
      },
      latestResponses,
    });
  } catch (error) {
    console.error("Unexpected dashboard error:", error);

    return NextResponse.json(
      { error: "Unable to load the dashboard." },
      { status: 500 },
    );
  }
}