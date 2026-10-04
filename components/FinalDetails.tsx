"use client";

import { useSyncExternalStore } from "react";

import { getWeddingPhase, type WeddingPhase } from "@/lib/wedding-schedule";
import Container from "./Container";

const CHURCH_MAP = "https://maps.app.goo.gl/igjWWgzQkFk3pheC9";
const RECEPTION_MAP = "https://maps.app.goo.gl/NrS2D5D9DjbPobhQA";

function subscribeToClock(onChange: () => void) {
  const interval = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(interval);
}

function getCurrentPhase(): WeddingPhase {
  const preview = new URLSearchParams(window.location.search).get("preview");

  if (preview === "rsvp-closed" || preview === "final-week") {
    return preview;
  }

  return getWeddingPhase();
}

function getServerPhase(): WeddingPhase {
  return "normal";
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      fill="none"
      className="h-3 w-3 shrink-0"
    >
      <path
        d="M3 9 9 3M4 3h5v5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      fill="none"
      className="h-3 w-3 shrink-0"
    >
      <path
        d="M6 1.75v7M3.5 6.75 6 9.25l2.5-2.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const actionClassName =
  "inline-flex min-h-11 items-center gap-2 border-b border-[#d2a641] pb-1 text-[10px] uppercase tracking-[0.24em] text-[var(--gold-text)] transition-colors duration-300 hover:text-[#181818] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#d2a641]";

type FinalDetailsProps = {
  placement: "featured" | "inline";
};

export default function FinalDetails({ placement }: FinalDetailsProps) {
  const phase = useSyncExternalStore(
    subscribeToClock,
    getCurrentPhase,
    getServerPhase,
  );

  const shouldShow =
    (placement === "featured" && phase === "final-week") ||
    (placement === "inline" && phase === "rsvp-closed");

  if (!shouldShow) return null;

  const isFinalWeek = phase === "final-week";

  const checklist = [
    {
      title: "Check your invitation time",
      detail:
        "Day guests are invited to arrive at St Andrew's Church from 12:00pm. Evening guests can join us at Longridge House from 7:00pm.",
    },
    {
      title: "Save the directions",
      detail:
        "Keep both locations handy before you set off. Allow a little extra time for on-street parking at the church.",
      links: [
        ["Church map", CHURCH_MAP],
        ["Reception map", RECEPTION_MAP],
      ],
    },
    {
      title: "Plan your journey",
      detail:
        "Day guests will make their own way from the church to Longridge House. If you plan to use a taxi later, please book it ahead of the wedding.",
    },
    {
      title: "Tell us about a change",
      detail:
        "If your plans or dietary requirements have changed since you replied, please email us as soon as possible.",
      links: [
        ["Email us", "mailto:humphreywedding26@yahoo.com"],
      ],
    },
  ];

  return (
    <section
      id="details"
      className={`scroll-mt-28 border-y border-[#e6e2da] bg-[#f8f6f2] ${
        placement === "featured"
          ? "pb-20 pt-32 md:pb-28 md:pt-40"
          : "py-20 md:py-28"
      }`}
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold-text)] md:text-[11px] md:tracking-[0.38em]">
              {isFinalWeek ? "One week to go" : "Final details"}
            </p>

            <h2 className="mt-4 max-w-lg font-serif text-4xl leading-[1.02] md:mt-6 md:text-7xl">
              {isFinalWeek
                ? "The final week is here."
                : "You’re all set."}
            </h2>

            <p className="mt-6 max-w-lg text-base leading-8 text-neutral-600 md:mt-8 md:text-sm">
              {isFinalWeek
                ? "Take a moment to check your arrival time, save the directions and confirm your travel plans. We can’t wait to see you."
                : "Online RSVPs are now closed, but everything you need for the day remains here. Keep these details handy as the celebration gets closer."}
            </p>

            <div className="mt-8 inline-flex items-center gap-3 border border-[#d9d3c9] px-4 py-3 text-[9px] uppercase tracking-[0.25em] text-neutral-500">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[#d2a641]"
              />
              {isFinalWeek
                ? "Saturday, 19 December 2026"
                : "RSVPs closed · 17 October 2026"}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              {isFinalWeek ? "Your final-week checklist" : "Keep these to hand"}
            </p>

            <div className="mt-5 border-t border-[#d9d3c9]">
              {checklist.map((item, index) => (
                <article
                  key={item.title}
                  className="grid gap-4 border-b border-[#d9d3c9] py-6 sm:grid-cols-[2.5rem_1fr] md:py-7"
                >
                  <p
                    aria-hidden="true"
                    className="font-serif text-2xl text-[var(--gold-text)]"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </p>

                  <div>
                    <h3 className="font-serif text-2xl leading-tight md:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600 md:text-sm md:leading-8">
                      {item.detail}
                    </p>

                    {item.links && (
                      <div className="mt-3 flex flex-wrap gap-x-7 gap-y-1">
                        {item.links.map(([label, href]) => (
                          <a
                            key={label}
                            href={href}
                            target={href.startsWith("http") ? "_blank" : undefined}
                            rel={href.startsWith("http") ? "noreferrer" : undefined}
                            className={actionClassName}
                          >
                            {label} <ArrowIcon />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-x-8 gap-y-2">
              <a href="/api/calendar?type=day" className={actionClassName}>
                Day guest calendar <DownloadIcon />
              </a>
              <a href="/api/calendar?type=evening" className={actionClassName}>
                Evening guest calendar <DownloadIcon />
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
