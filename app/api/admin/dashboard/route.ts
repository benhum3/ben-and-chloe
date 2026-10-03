import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { recordAppError } from "@/lib/error-monitoring";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 401 },
    );
  }

  try {
    const [
      { data: households, error: householdsError },
      { data: guests, error: guestsError },
      { data: errorEvents, error: errorEventsError },
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
            invitation_type,
            attending,
            dietary_requirements,
            updated_at
          `,
        )
        .order("full_name", { ascending: true }),

      supabaseAdmin
        .from("app_error_events")
        .select(
          "id, source, message, severity, status_code, fingerprint, created_at",
        )
        .gte(
          "created_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        )
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    if (householdsError) {
      console.error("Dashboard household query failed:", householdsError);
      await recordAppError({
        source: "admin-dashboard",
        message: "Dashboard household query failed",
        statusCode: 500,
        metadata: { stage: "households", code: householdsError.code },
      });

      return NextResponse.json(
        { error: "Unable to load household data." },
        { status: 500 },
      );
    }

    if (guestsError) {
      console.error("Dashboard guest query failed:", guestsError);
      await recordAppError({
        source: "admin-dashboard",
        message: "Dashboard guest query failed",
        statusCode: 500,
        metadata: { stage: "guests", code: guestsError.code },
      });

      return NextResponse.json(
        { error: "Unable to load guest data." },
        { status: 500 },
      );
    }

    const householdRows = households ?? [];
    const guestRows = guests ?? [];
    const errorEventRows = errorEventsError ? [] : (errorEvents ?? []);
    const last24Hours = Date.now() - 24 * 60 * 60 * 1000;

    if (errorEventsError) {
      console.warn(
        "Dashboard error monitor query failed:",
        errorEventsError.code,
      );
    }

    const householdMap = new Map(
      householdRows.map((household) => [household.id, household]),
    );
    const invitationTypesByHousehold = new Map<string, Set<string>>();

    guestRows.forEach((guest) => {
      const invitationTypes =
        invitationTypesByHousehold.get(guest.household_id) ?? new Set<string>();
      invitationTypes.add(guest.invitation_type);
      invitationTypesByHousehold.set(guest.household_id, invitationTypes);
    });

    function getHouseholdInvitationType(householdId: string) {
      const invitationTypes = invitationTypesByHousehold.get(householdId);

      if (invitationTypes && invitationTypes.size > 1) return "mixed";
      return invitationTypes?.values().next().value ?? "day";
    }

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
          invitationType: getHouseholdInvitationType(household.id),
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
        invitationType: guest.invitation_type,
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
          (household) => getHouseholdInvitationType(household.id) === "day",
        ).length,
        eveningHouseholds: householdRows.filter(
          (household) =>
            getHouseholdInvitationType(household.id) === "evening",
        ).length,
        mixedHouseholds: householdRows.filter(
          (household) =>
            getHouseholdInvitationType(household.id) === "mixed",
        ).length,
        householdsResponded,
        householdsPending:
          householdRows.length - householdsResponded,
      },
      latestResponses,
      guests: guestsWithHouseholds,
      songRequests,
      messages,
      monitor: {
        available: !errorEventsError,
        errorsLast24Hours: errorEventRows.filter(
          (event) => new Date(event.created_at).getTime() >= last24Hours,
        ).length,
        trackedLast30Days: errorEventRows.length,
        recentEvents: errorEventRows.map((event) => ({
          id: event.id,
          source: event.source,
          message: event.message,
          severity: event.severity,
          statusCode: event.status_code,
          fingerprint: event.fingerprint,
          createdAt: event.created_at,
        })),
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Unexpected dashboard error:", error);
    await recordAppError({
      source: "admin-dashboard",
      message: "Unexpected dashboard failure",
      severity: "critical",
      statusCode: 500,
    });

    return NextResponse.json(
      { error: "Unable to load the dashboard." },
      { status: 500 },
    );
  }
}
