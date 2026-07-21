"use client";

import { useEffect, useState } from "react";

import Container from "./Container";
import Monogram from "./Monogram";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  const links = [
    ["The Day", "#day"],
    ["Venue", "#venue"],
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
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              className="text-[11px] uppercase tracking-[0.28em] text-neutral-600 md:hidden"
            >
              Menu
            </button>
          </div>
        </Container>
      </nav>

      <div
        className={`fixed inset-0 z-[60] bg-[#181818] text-[#f8f6f2] transition-all duration-500 md:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={closeMenu}
          aria-label="Close navigation menu"
          className="absolute right-6 top-6 text-xs uppercase tracking-[0.3em]"
        >
          Close
        </button>

        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-14">
            <Monogram size="small" />
          </div>

          <div className="flex flex-col items-center gap-8 font-serif text-4xl">
            {links.map(([label, href]) => (
              <a key={label} href={href} onClick={closeMenu}>
                {label}
              </a>
            ))}

            <a
              href="/rsvp"
              onClick={closeMenu}
              className="mt-6 rounded-full border border-[#A97A3D] px-8 py-3 text-base uppercase tracking-[0.25em] text-[#A97A3D] transition hover:bg-[#A97A3D] hover:text-white"
            >
              Respond
            </a>
          </div>
        </div>
      </div>
    </>
  );
}