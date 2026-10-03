import type { GuestAnswer, InvitationType } from "@/types/rsvp";

type ThankYouStepProps = {
  nobodyAttending: boolean;
  wasUpdate: boolean;
  attendingGuests: GuestAnswer[];
};

export default function ThankYouStep({
  nobodyAttending,
  wasUpdate,
  attendingGuests,
}: ThankYouStepProps) {
  const guestsByInvitationType = attendingGuests.reduce<
    Record<InvitationType, GuestAnswer[]>
  >(
    (groups, guest) => {
      groups[guest.invitationType].push(guest);
      return groups;
    },
    { day: [], evening: [] },
  );
  const attendingInvitationTypes = (
    ["day", "evening"] as InvitationType[]
  ).filter((type) => guestsByInvitationType[type].length > 0);
  const isMixedHousehold = attendingInvitationTypes.length > 1;
  let message: string;

  if (wasUpdate) {
    message = nobodyAttending
      ? "Your updated response has been received. We’re sorry you won’t be able to join us."
      : "Your updated response has been received. We can’t wait to celebrate with you.";
  } else {
    message = nobodyAttending
      ? "Thank you for letting us know. We’re sorry you won’t be able to join us."
      : "Thank you for taking the time to respond. We can’t wait to celebrate with you.";
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="rsvp-success-mark mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-[#d2a641] text-xl text-[var(--gold-text)]"
      >
        ✓
      </div>

      <p className="mb-6 text-xs uppercase tracking-[0.42em] text-neutral-500">
        Thank You
      </p>

      <h1 className="font-serif text-5xl leading-none md:text-7xl">
        Response Received
      </h1>

      <p className="mt-8 max-w-lg text-sm leading-8 text-neutral-600">
        {message}
      </p>

      {!nobodyAttending && (
        <div className="mt-9 w-full max-w-lg border-y border-[#e6e2da] py-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold-text)]">
            We look forward to seeing you
          </p>

          {isMixedHousehold ? (
            <div className="mt-5 space-y-6 text-left">
              <InvitationSummary
                invitationType="day"
                guests={guestsByInvitationType.day}
              />
              <InvitationSummary
                invitationType="evening"
                guests={guestsByInvitationType.evening}
              />
            </div>
          ) : attendingInvitationTypes[0] === "day" ? (
            <p className="mt-3 font-serif text-2xl leading-8">
              St Andrew’s Church · From 12:00pm
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="font-serif text-2xl leading-8">
                Longridge House · From 7:00pm
              </p>
              <p className="text-sm leading-7 text-neutral-600">
                If you’d like to join us earlier, you’re also very welcome at
                the ceremony at St Andrew’s Church at 12:30pm, with arrival from
                12:00pm.
              </p>
            </div>
          )}

          <p className="mt-2 text-sm text-neutral-500">
            Saturday, 19 December 2026
          </p>

          {!isMixedHousehold && (
            <a
              href={`/api/calendar?type=${attendingInvitationTypes[0]}`}
              className="mt-5 inline-flex border-b border-[#d2a641] pb-1 text-[10px] uppercase tracking-[0.24em] text-[var(--gold-text)] transition hover:text-[#181818]"
            >
              Add {attendingInvitationTypes[0]} invitation to calendar
            </a>
          )}
        </div>
      )}

      <p className="mt-10 font-serif text-3xl">
        Benjamin &amp; Chloe
      </p>
    </>
  );
}

function InvitationSummary({
  invitationType,
  guests,
}: {
  invitationType: InvitationType;
  guests: GuestAnswer[];
}) {
  return (
    <div className="border-l border-[#d2a641] pl-5">
      <p className="text-[9px] uppercase tracking-[0.24em] text-[var(--gold-text)]">
        {invitationType === "day" ? "Day Invitation" : "Evening Invitation"}
      </p>
      <p className="mt-2 text-sm text-neutral-600">
        {guests.map((guest) => guest.fullName).join(" & ")}
      </p>
      <p className="mt-2 font-serif text-xl leading-7">
        {invitationType === "day"
          ? "St Andrew’s Church · From 12:00pm"
          : "Longridge House · From 7:00pm"}
      </p>
      <a
        href={`/api/calendar?type=${invitationType}`}
        className="mt-3 inline-flex border-b border-[#d2a641] pb-1 text-[9px] uppercase tracking-[0.2em] text-[var(--gold-text)] transition hover:text-[#181818]"
      >
        Add to calendar
      </a>
    </div>
  );
}
