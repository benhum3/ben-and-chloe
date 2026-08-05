"use client";

import { useEffect, useSyncExternalStore } from "react";

type WeddingPhase =
  | "normal"
  | "rsvp-closed"
  | "final-week"
  | "wedding-day"
  | "after";

function getWeddingPhase(now: Date): WeddingPhase {
  const rsvpClose = new Date("2026-09-02T00:00:00+01:00");
  const finalWeek = new Date("2026-12-12T00:00:00Z");
  const weddingStart = new Date("2026-12-19T00:00:00Z");
  const weddingEnd = new Date("2026-12-20T00:00:00Z");

  if (now >= weddingEnd) return "after";
  if (now >= weddingStart) return "wedding-day";
  if (now >= finalWeek) return "final-week";
  if (now >= rsvpClose) return "rsvp-closed";
  return "normal";
}

function subscribeToClock(onChange: () => void) {
  const interval = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(interval);
}

function getCurrentPhase() {
  const preview = new URLSearchParams(window.location.search).get("preview");

  if (preview === "final-week" || preview === "after") {
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

  if (phase === "normal" || phase === "rsvp-closed") return null;

  if (phase === "after") {
    return (
      <section className="bg-[#181818] px-6 pb-16 pt-32 text-center text-[#f8f6f2] md:pb-20 md:pt-36">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">
          Thank you
        </p>
        <h1 className="mt-5 font-serif text-5xl md:text-7xl">
          What a wonderful day.
        </h1>
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
    ...(phase === "wedding-day" ? [["Photos", "#photos"]] : []),
    ["Calendar", "/api/calendar"],
  ];

  return (
    <section
      data-gold-theme="dark"
      className="bg-[#181818] px-6 pb-14 pt-32 text-[#f8f6f2] md:px-20 md:pb-16 md:pt-36"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold-text)]">
          Wedding day essentials
        </p>
        <div className="mt-5 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <h1 className="font-serif text-4xl leading-tight md:text-6xl">
              Everything you need for the day
            </h1>
            <p className="mt-4 text-sm leading-7 text-neutral-400">
              Saturday, 19 December · Guests arriving from 12:00pm
            </p>
          </div>

          <nav
            className={`grid w-full grid-cols-1 gap-3 lg:shrink-0 ${
              phase === "wedding-day"
                ? "sm:grid-cols-5 lg:w-[34rem]"
                : "sm:grid-cols-4 lg:w-[27rem]"
            }`}
            aria-label="Wedding day shortcuts"
          >
            {shortcuts.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="flex min-h-12 items-center justify-center rounded-full border border-white/20 px-4 py-3 text-center text-[10px] uppercase tracking-[0.24em] transition hover:border-[#d2a641] hover:text-[var(--gold-text)]"
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
