import ExistingRSVPBanner from "@/components/rsvp/ExistingRSVPBanner";
import GuestCard from "@/components/rsvp/GuestCard";
import type { GuestAnswer, Household } from "@/types/rsvp";

type ResponseStepProps = {
  household: Household;
  guests: GuestAnswer[];
  error: string;
  onAttendanceChange: (guestId: string, attending: boolean) => void;
  onContinue: () => void;
  onReset: () => void;
};

export default function ResponseStep({
  household,
  guests,
  error,
  onAttendanceChange,
  onContinue,
  onReset,
}: ResponseStepProps) {
  return (
    <>
      <p className="mb-6 text-xs uppercase tracking-[0.42em] text-neutral-500">
        Your Invitation
      </p>

      <h1 className="font-serif text-5xl leading-none md:text-7xl">
        Will You Join Us?
      </h1>

      <p className="mt-8 max-w-lg font-serif text-2xl leading-9">
        {household.invitation_name}
      </p>

      <div className="mt-6 w-full max-w-lg border-y border-[#e6e2da] py-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#A97A3D]">
          {household.invitation_type === "day"
            ? "Day Invitation"
            : "Evening Invitation"}
        </p>

        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-neutral-600">
          {household.invitation_type === "day"
            ? "We’re delighted to invite you to join us for the full celebration, beginning at St Andrew’s Church from 12:00pm."
            : "We’re delighted to invite you to join our evening celebration at Longridge House from 7:00pm."}
        </p>
      </div>

      <p className="mt-6 max-w-lg text-sm leading-7 text-neutral-600">
        Please select a response for each guest named on this invitation.
      </p>

      {household.submitted_at && (
        <div className="w-full max-w-lg">
          <ExistingRSVPBanner submittedAt={household.submitted_at} />
        </div>
      )}

      <div className="mt-10 w-full max-w-lg space-y-5">
        {guests.map((guest) => (
          <GuestCard
            key={guest.id}
            guest={guest}
            onAttendanceChange={onAttendanceChange}
          />
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-6 text-sm leading-6 text-red-700">
          {error}
        </p>
      )}

      <div className="mt-8 grid w-full max-w-lg gap-4">
        <button
          type="button"
          onClick={onContinue}
          className="rsvp-action rounded-full border border-[#A97A3D] bg-[#A97A3D] px-6 py-4 text-xs uppercase tracking-[0.3em] text-white hover:bg-transparent hover:text-[#A97A3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A97A3D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f8f6f2]"
        >
          Continue
        </button>

        <button
          type="button"
          onClick={onReset}
          className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 transition duration-300 hover:text-[#A97A3D] focus-visible:outline-none focus-visible:text-[#A97A3D]"
        >
          This Is Not My Invitation
        </button>
      </div>
    </>
  );
}
