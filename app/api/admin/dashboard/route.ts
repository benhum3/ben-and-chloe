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
            invitation_type,
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

    const householdMap = new Map(
      householdRows.map((household) => [household.id, household]),
    );

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
          invitationType: household.invitation_type,
          submittedAt: household.submitted_at,
          attending: householdGuests.filter(
            (guest) => guest.attending === true,
          ).length,
          declined: householdGuests.filter(
            (guest) => guest.attending === false,
          ).length,
        };
      });

    const guestsWithHouseholds = guestRows.map((guest) => {
      const household = householdMap.get(guest.household_id);

      return {
        id: guest.id,
        fullName: guest.full_name,
        householdId: guest.household_id,
        householdName: household?.invitation_name ?? "Unknown household",
        invitationType: household?.invitation_type ?? "day",
        attending: guest.attending,
        dietaryRequirements: guest.dietary_requirements,
        submittedAt: household?.submitted_at ?? null,
      };
    });

    const songRequests = householdRows
      .filter(
        (household) =>
          household.song_request &&
          household.song_request.trim().length > 0,
      )
      .map((household) => ({
        id: household.id,
        invitationName: household.invitation_name,
        songRequest: household.song_request,
      }));

    const messages = householdRows
      .filter(
        (household) =>
          household.message && household.message.trim().length > 0,
      )
      .map((household) => ({
        id: household.id,
        invitationName: household.invitation_name,
        message: household.message,
      }));

    return NextResponse.json({
      stats: {
        totalGuests: guestRows.length,
        attending,
        declined,
        pending,
        totalHouseholds: householdRows.length,
        dayHouseholds: householdRows.filter(
          (household) => household.invitation_type === "day",
        ).length,
        eveningHouseholds: householdRows.filter(
          (household) => household.invitation_type === "evening",
        ).length,
        householdsResponded,
        householdsPending:
          householdRows.length - householdsResponded,
      },
      latestResponses,
      guests: guestsWithHouseholds,
      songRequests,
      messages,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Unexpected dashboard error:", error);

    return NextResponse.json(
      { error: "Unable to load the dashboard." },
      { status: 500 },
    );
  }
}
