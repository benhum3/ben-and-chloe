"use client";

import { useEffect, useRef, useState } from "react";

import Container from "./Container";
import Monogram from "./Monogram";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);

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
  ];

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
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
            className="h-full bg-[#A97A3D] transition-[width] duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <Container>
          <div
            className={`flex items-center justify-between transition-all duration-500 ${
              scrolled
                ? "rounded-xl border border-[#e6e2da] bg-[#f8f6f2]/85 px-5 py-4 shadow-sm backdrop-blur-md"
                : "border border-transparent bg-transparent px-5 py-4"
            }`}
          >
            <a
              href="#home"
              aria-label="Benjamin and Chloe"
              className="transition-transform duration-300 hover:scale-105"
            >
              <Monogram size="small" />
            </a>

            <div className="hidden items-center gap-8 md:flex">
              {links.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="group relative text-[11px] uppercase tracking-[0.28em] text-neutral-500 transition hover:text-[#181818]"
                >
                  {label}

                  <span className="absolute -bottom-2 left-0 h-px w-0 bg-[#A97A3D] transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </div>

            <a
              href="/rsvp"
              className="hidden rounded-full border border-[#A97A3D] px-5 py-2 text-[11px] uppercase tracking-[0.28em] text-[#A97A3D] transition-all duration-300 hover:bg-[#A97A3D] hover:text-white md:block"
            >
              Respond
            </a>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="min-h-11 min-w-11 text-[11px] uppercase tracking-[0.28em] text-neutral-600 md:hidden"
            >
              Menu
            </button>
          </div>
        </Container>
      </nav>

      <div
        ref={menuPanelRef}
        id="mobile-navigation"
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
          className="absolute right-5 top-5 min-h-11 px-2 text-xs uppercase tracking-[0.3em] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#A97A3D]"
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
            className={`mt-7 h-px bg-[#A97A3D] transition-all duration-700 ${
              menuOpen ? "w-12 opacity-100" : "w-0 opacity-0"
            }`}
          />

          <nav
            aria-label="Mobile navigation"
            className="mt-10 flex flex-col items-center gap-7 font-serif text-[2.35rem] leading-none"
          >
            {links.map(([label, href], index) => (
              <a
                key={label}
                href={href}
                onClick={closeMenu}
                className={`transition-all duration-500 hover:text-[#C79A61] focus-visible:text-[#C79A61] focus-visible:outline-none ${
                  menuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: `${140 + index * 65}ms` }}
              >
                {label}
              </a>
            ))}

            <a
              href="/rsvp"
              onClick={closeMenu}
              className={`mt-4 rounded-full border border-[#A97A3D] px-8 py-3.5 text-[11px] uppercase tracking-[0.28em] text-[#C79A61] transition-all duration-500 hover:bg-[#A97A3D] hover:text-white focus-visible:bg-[#A97A3D] focus-visible:text-white focus-visible:outline-none ${
                menuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: "420ms" }}
            >
              Respond
            </a>
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
