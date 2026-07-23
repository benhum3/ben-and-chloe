type ThankYouStepProps = {
  nobodyAttending: boolean;
  wasUpdate: boolean;
  invitationType: "day" | "evening";
};

export default function ThankYouStep({
  nobodyAttending,
  wasUpdate,
  invitationType,
}: ThankYouStepProps) {
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
        className="rsvp-success-mark mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-[#A97A3D] text-xl text-[#A97A3D]"
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
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#A97A3D]">
            We look forward to seeing you
          </p>

          <p className="mt-3 font-serif text-2xl leading-8">
            {invitationType === "day"
              ? "St Andrew’s Church · From 12:00pm"
              : "Longridge House · From 7:00pm"}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Saturday, 19 December 2026
          </p>
        </div>
      )}

      <p className="mt-10 font-serif text-3xl">
        Benjamin &amp; Chloe
      </p>
    </>
  );
}
