"use client";

import { useEffect, useState } from "react";

const weddingDate = new Date("2026-12-19T12:30:00");

function getTimeLeft() {
  const difference = weddingDate.getTime() - new Date().getTime();

  if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function Countdown() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeLeft());

    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-10 grid w-full max-w-xs grid-cols-2 gap-3 sm:max-w-xl md:mt-12 md:grid-cols-4 md:gap-4">
      {[
        ["Days", timeLeft.days],
        ["Hours", timeLeft.hours],
        ["Minutes", timeLeft.minutes],
        ["Seconds", timeLeft.seconds],
      ].map(([label, value]) => (
        <div key={label} className="border border-neutral-300 px-4 py-4">
          <div className="font-serif text-3xl">{mounted ? value : "--"}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}