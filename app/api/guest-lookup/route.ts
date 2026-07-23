import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { consumeRateLimit } from "@/lib/rate-limit";

type LookupRequest = {
  name?: unknown;
};

export async function POST(request: Request) {
  try {
    const rateLimit = consumeRateLimit(request, {
      namespace: "guest-lookup",
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many searches. Please wait a few minutes and try again." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        },
      );
    }

    const body = (await request.json()) as LookupRequest;

    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      body.name.length > 160
    ) {
      return NextResponse.json(
        { error: "Please enter the name shown on your invitation." },
        { status: 400 },
      );
    }

    const searchName = body.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    const { data: household, error: householdError } =
      await supabaseAdmin
        .from("households")
        .select(
          `
            id,
            invitation_name,
            invitation_type,
            song_request,
            message,
            submitted_at
          `,
        )
        .eq("search_name", searchName)
        .maybeSingle();

    if (householdError) {
      console.error("Household lookup failed:", householdError);

      return NextResponse.json(
        { error: "We could not check your invitation. Please try again." },
        { status: 500 },
      );
    }

    if (!household) {
      return NextResponse.json(
        {
          error:
            "We could not find an invitation under that name. Please check the spelling and try again.",
        },
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
      .eq("household_id", household.id)
      .order("created_at", { ascending: true });

    if (guestsError) {
      console.error("Guest lookup failed:", guestsError);

      return NextResponse.json(
        { error: "We could not load your invitation. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      household,
      guests: guests ?? [],
    });
  } catch (error) {
    console.error("Unexpected guest lookup error:", error);

    return NextResponse.json(
      { error: "We could not check your invitation. Please try again." },
      { status: 500 },
    );
  }
}
