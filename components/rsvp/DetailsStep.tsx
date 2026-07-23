import type { FormEvent } from "react";

import type { GuestAnswer, Household } from "@/types/rsvp";

type DetailsStepProps = {
  household: Household;
  attendingGuests: GuestAnswer[];
  nobodyAttending: boolean;
  songRequest: string;
  message: string;
  submitError: string;
  isSubmitting: boolean;
  onDietaryChange: (guestId: string, value: string) => void;
  onSongRequestChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
};

export default function DetailsStep({
  household,
  attendingGuests,
  nobodyAttending,
  songRequest,
  message,
  submitError,
  isSubmitting,
  onDietaryChange,
  onSongRequestChange,
  onMessageChange,
  onSubmit,
  onBack,
}: DetailsStepProps) {
  const isUpdate = Boolean(household.submitted_at);

  return (
    <>
      <p className="mb-6 text-xs uppercase tracking-[0.42em] text-neutral-500">
        A Few Details
      </p>

      <h1 className="font-serif text-5xl leading-none md:text-7xl">
        {nobodyAttending
          ? "Before You Go"
          : household.invitation_type === "day"
            ? "Before The Day"
            : "Before The Evening"}
      </h1>

      {nobodyAttending ? (
        <p className="mt-8 max-w-lg text-sm leading-8 text-neutral-600">
          We&apos;re sorry you won&apos;t be able to join us. You can leave a
          message below before submitting your response.
        </p>
      ) : (
        <p className="mt-8 max-w-lg text-sm leading-8 text-neutral-600">
          Please let us know about any dietary requirements for those attending.
        </p>
      )}

      <form
        onSubmit={onSubmit}
        className="mt-12 w-full max-w-lg space-y-7 text-left"
      >
        {attendingGuests.map((guest) => (
          <label key={guest.id} className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-neutral-500">
              Dietary Requirements — {guest.fullName}
            </span>

            <textarea
              value={guest.dietaryRequirements}
              onChange={(event) =>
                onDietaryChange(guest.id, event.target.value)
              }
              placeholder="Please let us know of any allergies or dietary requirements. Leave blank if none."
              className="rsvp-control min-h-28 w-full border border-[#e6e2da] bg-white/20 px-5 py-4 text-sm leading-7 outline-none"
            />
          </label>
        ))}

        {!nobodyAttending && (
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-neutral-500">
              Song Request
            </span>

            <input
              type="text"
              value={songRequest}
              onChange={(event) => onSongRequestChange(event.target.value)}
              placeholder="What song will get you on the dance floor?"
              className="rsvp-control w-full border border-[#e6e2da] bg-white/20 px-5 py-4 text-sm outline-none"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-neutral-500">
            Message
          </span>

          <textarea
            value={message}
            onChange={(event) => onMessageChange(event.target.value)}
            placeholder="Anything else you'd like us to know?"
            className="rsvp-control min-h-28 w-full border border-[#e6e2da] bg-white/20 px-5 py-4 text-sm leading-7 outline-none"
          />
        </label>

        {submitError && (
          <p
            role="alert"
            className="text-center text-sm leading-6 text-red-700"
          >
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rsvp-action w-full rounded-full border border-[#A97A3D] bg-[#A97A3D] px-6 py-4 text-xs uppercase tracking-[0.3em] text-white hover:bg-transparent hover:text-[#A97A3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A97A3D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f8f6f2] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? isUpdate
              ? "Updating Response..."
              : "Sending Response..."
            : isUpdate
              ? "Update RSVP"
              : "Send Response"}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full text-center text-[10px] uppercase tracking-[0.25em] text-neutral-500 transition duration-300 hover:text-[#A97A3D] focus-visible:outline-none focus-visible:text-[#A97A3D] disabled:opacity-50"
        >
          Back To Guest Responses
        </button>
      </form>
    </>
  );
}
