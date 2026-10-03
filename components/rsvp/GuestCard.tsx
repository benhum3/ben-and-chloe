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
    <div className="border border-[#ded9cf] bg-white/15 px-5 py-6 transition-colors duration-300 hover:border-[#c9b58f]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-serif text-2xl">{guest.fullName}</p>
        <span className="border border-[#d2a641]/35 bg-[#d2a641]/5 px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-[var(--gold-text)]">
          {guest.invitationType === "day" ? "Day Guest" : "Evening Guest"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onAttendanceChange(guest.id, true)}
          aria-pressed={guest.attending === true}
          className={`rounded-full border px-4 py-4 text-[10px] uppercase tracking-[0.25em] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d2a641] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f6f2] ${
            guest.attending === true
              ? "border-[#d2a641] bg-[#d2a641] text-[#181818]"
              : "border-[#d2a641]/50 text-[var(--gold-text)] hover:border-[#d2a641] hover:bg-[#d2a641]/10"
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
          className={`rounded-full border px-4 py-4 text-[10px] uppercase tracking-[0.25em] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d2a641] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f6f2] ${
            guest.attending === false
              ? "border-[#d2a641] bg-[#d2a641] text-[#181818]"
              : "border-[#d2a641]/50 text-[var(--gold-text)] hover:border-[#d2a641] hover:bg-[#d2a641]/10"
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
