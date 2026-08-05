"use client";

import { useState } from "react";

export default function MobileRSVP() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <aside
      data-rsvp-before-wedding
      aria-label="RSVP reminder"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 rounded-xl border border-[#d2a641]/60 bg-[#181818]/95 p-3 text-[#f8f6f2] shadow-2xl backdrop-blur-md md:hidden"
    >
      <div className="flex items-center gap-3">
        <a href="/rsvp" className="min-w-0 flex-1 px-2 py-1">
          <span className="block text-[9px] uppercase tracking-[0.28em] text-neutral-400">
            RSVP by 1 September
          </span>
          <span className="mt-1 block font-serif text-xl">Kindly respond</span>
        </a>

        <a
          href="/rsvp"
          className="shrink-0 rounded-full bg-[#d2a641] px-5 py-3 text-[10px] uppercase tracking-[0.24em] text-[#181818]"
        >
          RSVP
        </a>

        <button
          type="button"
          aria-label="Dismiss RSVP reminder"
          onClick={() => setVisible(false)}
          className="min-h-10 min-w-8 text-xl font-light text-neutral-400"
        >
          ×
        </button>
      </div>
    </aside>
  );
}
