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
    <div className="border border-[#ded9cf] bg-white/15 px-5 py-6 transition duration-300 hover:border-[#c9b58f] hover:shadow-[0_14px_40px_rgba(24,24,24,0.06)]">
      <p className="font-serif text-2xl">{guest.fullName}</p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onAttendanceChange(guest.id, true)}
          aria-pressed={guest.attending === true}
          className={`border px-4 py-4 text-[10px] uppercase tracking-[0.25em] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A97A3D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f6f2] ${
            guest.attending === true
              ? "border-[#181818] bg-[#181818] text-[#f8f6f2]"
              : "border-[#ded9cf] hover:-translate-y-0.5 hover:border-[#181818]"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-2">
            {guest.attending === true && (
              <span aria-hidden="true">✓</span>
            )}
            Happily Accept
          </span>
        </button>

        <button
          type="button"
          onClick={() => onAttendanceChange(guest.id, false)}
          aria-pressed={guest.attending === false}
          className={`border px-4 py-4 text-[10px] uppercase tracking-[0.25em] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A97A3D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f6f2] ${
            guest.attending === false
              ? "border-[#181818] bg-[#181818] text-[#f8f6f2]"
              : "border-[#ded9cf] hover:-translate-y-0.5 hover:border-[#181818]"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-2">
            {guest.attending === false && (
              <span aria-hidden="true">✓</span>
            )}
            Regretfully Decline
          </span>
        </button>
      </div>
    </div>
  );
}
