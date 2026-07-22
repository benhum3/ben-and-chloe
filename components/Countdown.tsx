"use client";

import { useEffect, useState } from "react";

const weddingDate = new Date("2026-12-19T12:30:00");

function getTimeLeft() {
  const difference = weddingDate.getTime() - new Date().getTime();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function Countdown() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    setMounted(true);

    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const countdownItems = [
    ["Days", timeLeft.days],
    ["Hours", timeLeft.hours],
    ["Minutes", timeLeft.minutes],
    ["Seconds", timeLeft.seconds],
  ];

  return (
    <div className="mt-8 w-full max-w-2xl md:mt-14">
      <p className="mb-4 text-[9px] uppercase tracking-[0.32em] text-neutral-500 sm:text-[10px] md:mb-6 md:tracking-[0.35em]">
        Countdown to the celebration
      </p>

      <div className="grid grid-cols-4 border-y border-[#e6e2da] py-4 md:py-6">
        {countdownItems.map(([label, value], index) => (
          <div
            key={label}
            className={`px-1 text-center sm:px-2 ${
              index !== 3 ? "border-r border-[#e6e2da]" : ""
            }`}
          >
            <div
              key={String(value)}
              className="animate-count font-serif text-[1.65rem] leading-none text-[#181818] sm:text-4xl md:text-5xl"
            >
              {mounted ? value : "--"}
            </div>

            <div className="mt-2 text-[8px] uppercase tracking-[0.18em] text-neutral-500 sm:text-[10px] sm:tracking-[0.25em] md:mt-3">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}