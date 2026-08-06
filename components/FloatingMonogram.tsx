"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const HERO_TARGET_ID = "hero-monogram-target";
const NAV_TARGET_ID = "nav-monogram-target";
const FLIGHT_DELAY = 40;

function getMonogramFlightProgress(scrollY: number, viewportHeight: number) {
  const travelDistance = Math.min(Math.max(viewportHeight * 0.32, 190), 320);
  const rawProgress = Math.min(
    Math.max((scrollY - FLIGHT_DELAY) / travelDistance, 0),
    1,
  );

  return 1 - Math.pow(1 - rawProgress, 3);
}

export default function FloatingMonogram() {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const monogram = linkRef.current;
    const heroTarget = document.getElementById(HERO_TARGET_ID);
    const navTarget = document.getElementById(NAV_TARGET_ID);

    if (!monogram || !heroTarget || !navTarget) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let frame = 0;

    const positionMonogram = () => {
      frame = 0;

      const heroRect = heroTarget.getBoundingClientRect();
      const navRect = navTarget.getBoundingClientRect();
      const flightProgress = getMonogramFlightProgress(
        window.scrollY,
        window.innerHeight,
      );
      const progress = reducedMotion.matches
        ? Number(flightProgress === 1)
        : flightProgress;
      const arc = reducedMotion.matches
        ? 0
        : Math.sin(Math.PI * progress) * Math.min(window.innerWidth * 0.025, 20);

      const left = heroRect.left + (navRect.left - heroRect.left) * progress;
      const top = heroRect.top + (navRect.top - heroRect.top) * progress - arc;
      const width = heroRect.width + (navRect.width - heroRect.width) * progress;
      const height = heroRect.height + (navRect.height - heroRect.height) * progress;

      monogram.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      monogram.style.width = `${width}px`;
      monogram.style.height = `${height}px`;
      monogram.style.opacity = "1";
    };

    const queuePositionUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(positionMonogram);
    };

    positionMonogram();
    window.addEventListener("scroll", queuePositionUpdate, { passive: true });
    window.addEventListener("resize", queuePositionUpdate);
    reducedMotion.addEventListener("change", queuePositionUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queuePositionUpdate);
      window.removeEventListener("resize", queuePositionUpdate);
      reducedMotion.removeEventListener("change", queuePositionUpdate);
    };
  }, []);

  return (
    <a
      ref={linkRef}
      href="#home"
      aria-label="Benjamin and Chloe — back to the top"
      className="fixed left-0 top-0 z-[51] block opacity-0 will-change-transform transition-opacity duration-300 hover:brightness-90 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#d2a641]"
    >
      <Image
        src="/brand/benjamin-chloe-monogram.svg"
        alt=""
        width={379}
        height={192}
        loading="eager"
        unoptimized
        className="h-full w-full object-contain"
      />
    </a>
  );
}

export { getMonogramFlightProgress, HERO_TARGET_ID, NAV_TARGET_ID };
