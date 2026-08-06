"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import Container from "./Container";
import FloatingMonogram, {
  getMonogramFlightProgress,
} from "./FloatingMonogram";
import Monogram from "./Monogram";

type PrimaryAction = "rsvp" | "none" | "photos" | "photos-after";

const SECTION_IDS = ["day", "venue", "travel", "faq", "contact"];

function subscribeToClock(onChange: () => void) {
  const interval = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(interval);
}

function getPrimaryAction(): PrimaryAction {
  const preview = new URLSearchParams(window.location.search).get("preview");

  if (preview === "photos") return "photos";
  if (preview === "after") return "photos-after";
  if (preview === "final-week") return "none";

  const now = new Date();

  if (now >= new Date("2026-12-20T00:00:00Z")) return "photos-after";
  if (now >= new Date("2026-12-19T00:00:00Z")) return "photos";
  if (now >= new Date("2026-10-01T00:00:00+01:00")) return "none";
  return "rsvp";
}

function getServerPrimaryAction(): PrimaryAction {
  return "rsvp";
}

export default function Navigation() {
  const primaryAction = useSyncExternalStore(
    subscribeToClock,
    getPrimaryAction,
    getServerPrimaryAction,
  );
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navReveal, setNavReveal] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (section): section is HTMLElement => Boolean(section),
    );

    const onScroll = () => {
      const monogramProgress = getMonogramFlightProgress(
        window.scrollY,
        window.innerHeight,
      );
      const revealProgress = Math.min(
        Math.max((monogramProgress - 0.48) / 0.52, 0),
        1,
      );

      setScrolled(monogramProgress > 0.48);
      setNavReveal(revealProgress);

      const readingLine = window.innerHeight * 0.42;
      const currentSection = sections.find((section) => {
        const bounds = section.getBoundingClientRect();
        return bounds.top <= readingLine && bounds.bottom > readingLine;
      });

      setActiveSection(currentSection?.id ?? "");

      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const progress =
        scrollableHeight > 0
          ? (window.scrollY / scrollableHeight) * 100
          : 0;

      setScrollProgress(Math.min(Math.max(progress, 0), 100));
    };

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = menuPanelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const links = [
    ["The Day", "#day"],
    ["Our Celebration", "#venue"],
    ["Travel", "#travel"],
    ["FAQs", "#faq"],
    ["Contact", "#contact"],
  ];
  const photosArePrimary =
    primaryAction === "photos" || primaryAction === "photos-after";
  const navigationLinks = primaryAction === "photos-after"
    ? []
    : primaryAction === "photos"
      ? links.filter(([label]) => ["The Day", "Travel", "Contact"].includes(label))
      : links;

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <FloatingMonogram />

      <nav
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 h-[2px] w-full overflow-hidden"
        >
          <div
            className="h-full bg-[#d2a641] transition-[width] duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <Container>
          <div
            className={`flex items-center justify-between rounded-xl border px-5 py-4 backdrop-blur-md transition-all duration-500 ${
              scrolled ? "shadow-sm" : "shadow-none"
            }`}
            style={{
              backgroundColor: `rgba(248, 246, 242, ${navReveal * 0.85})`,
              borderColor: `rgba(230, 226, 218, ${navReveal})`,
            }}
          >
            <div
              id="nav-monogram-target"
              aria-hidden="true"
              className="aspect-[379/192] w-[4.75rem] shrink-0 sm:w-20"
            />

            <div className="hidden items-center gap-6 md:flex">
              {navigationLinks.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  aria-current={
                    activeSection === href.slice(1) ? "location" : undefined
                  }
                  className={`group relative rounded-sm text-[11px] uppercase tracking-[0.28em] transition focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#d2a641] ${
                    activeSection === href.slice(1)
                      ? "text-[#181818]"
                      : "text-neutral-500 hover:text-[#181818]"
                  }`}
                >
                  {label}

                  <span
                    className={`absolute -bottom-2 left-0 h-px bg-[#d2a641] transition-all duration-300 group-hover:w-full ${
                      activeSection === href.slice(1) ? "w-full" : "w-0"
                    }`}
                  />
                </a>
              ))}
            </div>

            {primaryAction === "rsvp" && (
              <a
                href="/rsvp"
                data-rsvp-before-wedding
                className="hidden rounded-full border border-[#d2a641] px-5 py-2 text-[11px] uppercase tracking-[0.28em] text-[var(--gold-text)] transition-all duration-300 hover:bg-[#d2a641] hover:text-[#181818] focus-visible:bg-[#d2a641] focus-visible:text-[#181818] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#d2a641] md:block"
              >
                Respond
              </a>
            )}

            {photosArePrimary && (
              <a
                href="#photos"
                className="hidden rounded-full border border-[#d2a641] bg-[#d2a641] px-5 py-2 text-[11px] uppercase tracking-[0.28em] text-[#181818] transition-all duration-300 hover:bg-transparent hover:text-[var(--gold-text)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#d2a641] md:block"
              >
                Share Photos
              </a>
            )}

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="min-h-11 min-w-11 rounded-sm text-[11px] uppercase tracking-[0.28em] text-neutral-600 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#d2a641] md:hidden"
            >
              Menu
            </button>
          </div>
        </Container>
      </nav>

      <div
        ref={menuPanelRef}
        id="mobile-navigation"
        data-gold-theme="dark"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen ? true : undefined}
        className={`fixed inset-0 z-[60] bg-[#181818] text-[#f8f6f2] transition-all duration-500 md:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeMenu}
          aria-label="Close navigation menu"
          className="absolute right-5 top-5 min-h-11 px-2 text-xs uppercase tracking-[0.3em] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#d2a641]"
        >
          Close
        </button>

        <div className="flex h-full flex-col items-center px-6 pb-10 pt-20">
          <div
            className={`mt-auto transition-all duration-500 ${
              menuOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0"
            }`}
          >
            <Monogram size="small" />
          </div>

          <div
            className={`mt-7 h-px bg-[#d2a641] transition-all duration-700 ${
              menuOpen ? "w-12 opacity-100" : "w-0 opacity-0"
            }`}
          />

          <nav
            aria-label="Mobile navigation"
            className="mt-10 flex flex-col items-center gap-7 font-serif text-[2.35rem] leading-none"
          >
            {navigationLinks.map(([label, href], index) => (
              <a
                key={label}
                href={href}
                onClick={closeMenu}
                aria-current={
                  activeSection === href.slice(1) ? "location" : undefined
                }
                className={`transition-all duration-500 hover:text-[var(--gold-text)] focus-visible:text-[var(--gold-text)] focus-visible:outline-none ${
                  activeSection === href.slice(1)
                    ? "text-[var(--gold-text)]"
                    : ""
                } ${
                  menuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: `${140 + index * 65}ms` }}
              >
                {label}
              </a>
            ))}

            {primaryAction !== "none" && (
              <a
                href={photosArePrimary ? "#photos" : "/rsvp"}
                data-rsvp-before-wedding={
                  primaryAction === "rsvp" ? true : undefined
                }
                onClick={closeMenu}
                className={`mt-4 rounded-full border border-[#d2a641] px-8 py-3.5 text-[11px] uppercase tracking-[0.28em] transition-all duration-500 hover:bg-[#d2a641] hover:text-[#181818] focus-visible:bg-[#d2a641] focus-visible:text-[#181818] focus-visible:outline-none ${
                  photosArePrimary
                    ? "bg-[#d2a641] text-[#181818]"
                    : "text-[var(--gold-text)]"
                } ${
                  menuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "420ms" }}
              >
                {photosArePrimary ? "Share Photos" : "Respond"}
              </a>
            )}
          </nav>

          <p
            className={`mb-auto mt-10 text-[9px] uppercase tracking-[0.32em] text-neutral-500 transition-opacity duration-500 ${
              menuOpen ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDelay: "480ms" }}
          >
            19 December 2026
          </p>
        </div>
      </div>
    </>
  );
}
