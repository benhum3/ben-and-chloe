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

      <p className="mt-5 max-w-lg text-sm leading-7 text-neutral-600">
        Please select a response for each guest named on the invitation.
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
          className="border border-[#181818] px-6 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-[#181818] hover:text-[#f8f6f2]"
        >
          Continue
        </button>

        <button
          type="button"
          onClick={onReset}
          className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 transition hover:text-[#181818]"
        >
          This Is Not My Invitation
        </button>
      </div>
    </>
  );
}
