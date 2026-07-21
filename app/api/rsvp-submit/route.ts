import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

type GuestResponse = {
  id: string;
  attending: boolean;
  dietaryRequirements: string;
};

type SubmissionBody = {
  householdId: string;
  guests: GuestResponse[];
  songRequest: string;
  message: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SubmissionBody>;

    const householdId = body.householdId?.trim();
    const guests = body.guests;
    const songRequest = body.songRequest?.trim() ?? "";
    const message = body.message?.trim() ?? "";

    if (!householdId) {
      return NextResponse.json(
        { error: "A household ID is required." },
        { status: 400 },
      );
    }

    if (!Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json(
        { error: "At least one guest response is required." },
        { status: 400 },
      );
    }

    for (const guest of guests) {
      if (
        !guest.id ||
        typeof guest.attending !== "boolean" ||
        typeof guest.dietaryRequirements !== "string"
      ) {
        return NextResponse.json(
          { error: "One or more guest responses are invalid." },
          { status: 400 },
        );
      }
    }

    /*
     * Confirm that every submitted guest genuinely belongs to the household.
     * This prevents someone altering the request and updating unrelated guests.
     */
    const guestIds = guests.map((guest) => guest.id);

    const { data: databaseGuests, error: guestLookupError } =
      await supabaseAdmin
        .from("guests")
        .select("id, household_id")
        .in("id", guestIds);

    if (guestLookupError) {
      console.error("Guest verification failed:", guestLookupError);

      return NextResponse.json(
        { error: "We could not verify the invitation." },
        { status: 500 },
      );
    }

    const guestsAreValid =
      databaseGuests?.length === guests.length &&
      databaseGuests.every(
        (guest) => guest.household_id === householdId,
      );

    if (!guestsAreValid) {
      return NextResponse.json(
        { error: "The submitted guests do not match this invitation." },
        { status: 400 },
      );
    }

    /*
     * Update each guest's individual RSVP.
     */
    for (const guest of guests) {
      const { error: guestUpdateError } = await supabaseAdmin
        .from("guests")
        .update({
          attending: guest.attending,
          dietary_requirements: guest.attending
            ? guest.dietaryRequirements.trim() || null
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", guest.id)
        .eq("household_id", householdId);

      if (guestUpdateError) {
        console.error("Guest update failed:", guestUpdateError);

        return NextResponse.json(
          { error: "We could not save the guest responses." },
          { status: 500 },
        );
      }
    }

    /*
     * Save the shared household answers.
     */
    const { error: householdUpdateError } = await supabaseAdmin
      .from("households")
      .update({
        song_request: songRequest || null,
        message: message || null,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", householdId);

    if (householdUpdateError) {
      console.error("Household update failed:", householdUpdateError);

      return NextResponse.json(
        { error: "We could not complete the RSVP." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("RSVP submission failed:", error);

    return NextResponse.json(
      { error: "Something went wrong while submitting the RSVP." },
      { status: 500 },
    );
  }
}