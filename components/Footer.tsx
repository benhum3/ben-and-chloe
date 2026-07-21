import Container from "./Container";
import Monogram from "./Monogram";

export default function Footer() {
  return (
    <footer className="bg-[#111111] py-16 text-[#f8f6f2]">
      <Container>
        <div className="flex flex-col items-center text-center">
          <a
            href="#home"
            aria-label="Return to the top of the page"
            className="transition-transform duration-300 hover:scale-105"
          >
            <Monogram size="small" />
          </a>

          <p className="mt-8 font-serif text-3xl">
            Benjamin & Chloe
          </p>

          <p className="mt-3 text-[10px] uppercase tracking-[0.35em] text-neutral-500">
            19 December 2026
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
            <a href="#day" className="transition hover:text-white">
              The Day
            </a>

            <a href="#venue" className="transition hover:text-white">
              Venue
            </a>

            <a href="#travel" className="transition hover:text-white">
              Travel
            </a>

            <a href="#faq" className="transition hover:text-white">
              FAQs
            </a>

            <a href="/rsvp" className="transition hover:text-white">
              Respond
            </a>
          </div>

          <div className="mt-14 w-full border-t border-white/10 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 text-[9px] uppercase tracking-[0.22em] text-neutral-600 sm:flex-row">
              <p>St Andrew&apos;s Church · Longridge House</p>

              <a
                href="/admin"
                aria-label="Administration"
                className="transition hover:text-neutral-400"
              >
                Private
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}