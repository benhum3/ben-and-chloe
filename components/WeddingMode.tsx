"use client";

import { useEffect, useSyncExternalStore } from "react";

import { getWeddingPhase, type WeddingPhase } from "@/lib/wedding-schedule";

function subscribeToClock(onChange: () => void) {
  const interval = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(interval);
}

function getCurrentPhase() {
  const preview = new URLSearchParams(window.location.search).get("preview");

  if (
    preview === "rsvp-closed" ||
    preview === "final-week" ||
    preview === "after"
  ) {
    return preview;
  }

  if (preview === "photos") return "wedding-day";

  return getWeddingPhase(new Date());
}

function getServerPhase(): WeddingPhase {
  return "normal";
}

export default function WeddingMode() {
  const phase = useSyncExternalStore(
    subscribeToClock,
    getCurrentPhase,
    getServerPhase,
  );

  useEffect(() => {
    document.documentElement.dataset.weddingPhase = phase;

    return () => {
      delete document.documentElement.dataset.weddingPhase;
    };
  }, [phase]);

  if (
    phase === "normal" ||
    phase === "rsvp-closed" ||
    phase === "final-week"
  ) {
    return null;
  }

  if (phase === "after") {
    return (
      <section className="bg-[#181818] px-6 pb-16 pt-32 text-center text-[#f8f6f2] md:pb-20 md:pt-36">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">
          Thank you
        </p>
        <h2 className="mt-5 font-serif text-5xl md:text-7xl">
          What a wonderful day.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-neutral-300">
          Thank you for celebrating with us and making our wedding so special.
        </p>
      </section>
    );
  }

  const shortcuts = [
    ["Schedule", "#day"],
    ["Directions", "#travel"],
    ["Contact", "#contact"],
    ["Photos", "#photos"],
    ["Calendars", "#day"],
  ];

  return (
    <section
      data-gold-theme="dark"
      className="border-t border-white/10 bg-[#181818] px-6 py-20 text-[#f8f6f2] md:px-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold-text)]">
          Wedding day essentials
        </p>
        <div className="mt-5 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <h2 className="font-serif text-4xl leading-tight md:text-6xl">
              Everything you need for the day
            </h2>
            <p className="mt-4 text-sm leading-7 text-neutral-400">
              Saturday, 19 December · Guests arriving from 12:00pm
            </p>
          </div>

          <nav
            className={`grid w-full grid-cols-2 gap-3 lg:shrink-0 ${
              phase === "wedding-day"
                ? "sm:grid-cols-5 lg:w-[34rem]"
                : "sm:grid-cols-4 lg:w-[27rem]"
            }`}
            aria-label="Wedding day shortcuts"
          >
            {shortcuts.map(([label, href], index) => (
              <a
                key={label}
                href={href}
                className={`flex min-h-12 items-center justify-center rounded-full border border-[#d2a641] px-4 py-3 text-center text-[10px] uppercase tracking-[0.24em] text-[var(--gold-text)] transition hover:bg-[#d2a641] hover:text-[#181818] ${
                  index === shortcuts.length - 1 ? "col-span-2 sm:col-span-1" : ""
                }`}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
