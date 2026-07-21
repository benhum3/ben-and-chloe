import type { GuestAnswer } from "@/types/rsvp";

type GuestCardProps = {
  guest: GuestAnswer;
  onAttendanceChange: (guestId: string, attending: boolean) => void;
};

export default function GuestCard({
  guest,
  onAttendanceChange,
}: GuestCardProps) {
  return (
    <div className="border border-[#ded9cf] px-5 py-6">
      <p className="font-serif text-2xl">{guest.fullName}</p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onAttendanceChange(guest.id, true)}
          aria-pressed={guest.attending === true}
          className={`border px-4 py-4 text-[10px] uppercase tracking-[0.25em] transition ${
            guest.attending === true
              ? "border-[#181818] bg-[#181818] text-[#f8f6f2]"
              : "border-[#ded9cf] hover:border-[#181818]"
          }`}
        >
          Happily Accept
        </button>

        <button
          type="button"
          onClick={() => onAttendanceChange(guest.id, false)}
          aria-pressed={guest.attending === false}
          className={`border px-4 py-4 text-[10px] uppercase tracking-[0.25em] transition ${
            guest.attending === false
              ? "border-[#181818] bg-[#181818] text-[#f8f6f2]"
              : "border-[#ded9cf] hover:border-[#181818]"
          }`}
        >
          Regretfully Decline
        </button>
      </div>
    </div>
  );
}
