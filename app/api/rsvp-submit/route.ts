import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { consumeRateLimit } from "@/lib/rate-limit";

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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_DIETARY_LENGTH = 500;
const MAX_SONG_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 1_000;

export async function POST(request: Request) {
  try {
    const rateLimit = consumeRateLimit(request, {
      namespace: "rsvp-submit",
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a few minutes and try again." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        },
      );
    }

    const body = (await request.json()) as Partial<SubmissionBody>;

    const householdId = body.householdId?.trim();
    const guests = body.guests;
    const songRequest = body.songRequest?.trim() ?? "";
    const message = body.message?.trim() ?? "";

    if (!householdId || !UUID_PATTERN.test(householdId)) {
      return NextResponse.json(
        { error: "A household ID is required." },
        { status: 400 },
      );
    }

    if (!Array.isArray(guests) || guests.length === 0 || guests.length > 20) {
      return NextResponse.json(
        { error: "At least one guest response is required." },
        { status: 400 },
      );
    }

    for (const guest of guests) {
      if (
        !guest.id ||
        !UUID_PATTERN.test(guest.id) ||
        typeof guest.attending !== "boolean" ||
        typeof guest.dietaryRequirements !== "string" ||
        guest.dietaryRequirements.length > MAX_DIETARY_LENGTH
      ) {
        return NextResponse.json(
          { error: "One or more guest responses are invalid." },
          { status: 400 },
        );
      }
    }

    if (
      songRequest.length > MAX_SONG_LENGTH ||
      message.length > MAX_MESSAGE_LENGTH
    ) {
      return NextResponse.json(
        { error: "One or more responses are too long." },
        { status: 400 },
      );
    }

    const { error: submissionError } = await supabaseAdmin.rpc(
      "submit_household_rsvp",
      {
        payload: {
          householdId,
          guests,
          songRequest,
          message,
        },
      },
    );

    if (submissionError) {
      console.error("Atomic RSVP submission failed:", submissionError);

      return NextResponse.json(
        { error: "We could not save your RSVP. Please try again." },
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
