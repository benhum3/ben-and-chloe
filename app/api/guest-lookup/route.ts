import { NextResponse } from "next/server";

import { recordAppError } from "@/lib/error-monitoring";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { consumeRateLimit } from "@/lib/rate-limit";
import { isRsvpClosed } from "@/lib/wedding-schedule";

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

    if (isRsvpClosed()) {
      return NextResponse.json(
        {
          error:
            "The RSVP deadline has passed. Please contact Benjamin and Chloe if your plans have changed.",
        },
        { status: 410 },
      );
    }

    const body = (await request.json()) as LookupRequest;

    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      body.name.length > 160
    ) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 },
      );
    }

    const searchName = body.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    const householdFields = `
      id,
      invitation_name,
      invitation_type,
      song_request,
      message,
      submitted_at
    `;

    const householdResult = await supabaseAdmin
      .from("households")
      .select(householdFields)
      .eq("search_name", searchName)
      .maybeSingle();

    if (householdResult.error) {
      console.error("Household lookup failed:", householdResult.error);
      await recordAppError({
        source: "guest-lookup",
        message: "Household lookup query failed",
        statusCode: 500,
        metadata: { stage: "household", code: householdResult.error.code },
      });

      return NextResponse.json(
        { error: "We could not check your invitation. Please try again." },
        { status: 500 },
      );
    }

    let household = householdResult.data;

    if (!household) {
      const escapedName = searchName.replace(/[\\%_]/g, "\\$&");
      const { data: matchingGuests, error: matchingGuestsError } =
        await supabaseAdmin
          .from("guests")
          .select("household_id")
          .ilike("full_name", escapedName)
          .limit(10);

      if (matchingGuestsError) {
        console.error("Guest name lookup failed:", matchingGuestsError);
        await recordAppError({
          source: "guest-lookup",
          message: "Guest name lookup query failed",
          statusCode: 500,
          metadata: { stage: "guest", code: matchingGuestsError.code },
        });

        return NextResponse.json(
          { error: "We could not check your invitation. Please try again." },
          { status: 500 },
        );
      }

      const householdIds = [
        ...new Set((matchingGuests ?? []).map((guest) => guest.household_id)),
      ];

      if (householdIds.length > 1) {
        return NextResponse.json(
          {
            error:
              "We found more than one invitation under that name. Please enter the full household name shown on your invitation.",
          },
          { status: 409 },
        );
      }

      if (householdIds.length === 1) {
        const resolvedHouseholdResult = await supabaseAdmin
          .from("households")
          .select(householdFields)
          .eq("id", householdIds[0])
          .maybeSingle();

        if (resolvedHouseholdResult.error) {
          console.error(
            "Guest household lookup failed:",
            resolvedHouseholdResult.error,
          );
          await recordAppError({
            source: "guest-lookup",
            message: "Resolved household lookup query failed",
            statusCode: 500,
            metadata: {
              stage: "resolved-household",
              code: resolvedHouseholdResult.error.code,
            },
          });

          return NextResponse.json(
            { error: "We could not load your invitation. Please try again." },
            { status: 500 },
          );
        }

        household = resolvedHouseholdResult.data;
      }
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
          invitation_type,
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
      await recordAppError({
        source: "guest-lookup",
        message: "Household guest lookup query failed",
        statusCode: 500,
        metadata: { stage: "household-guests", code: guestsError.code },
      });

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
    await recordAppError({
      source: "guest-lookup",
      message: "Unexpected invitation lookup failure",
      severity: "critical",
      statusCode: 500,
      metadata: { stage: "unexpected" },
    });

    return NextResponse.json(
      { error: "We could not check your invitation. Please try again." },
      { status: 500 },
    );
  }
}
