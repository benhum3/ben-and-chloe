import Container from "./Container";
import Monogram from "./Monogram";

export default function Footer() {
  return (
    <footer className="bg-[#111111] py-16 text-[#f8f6f2] md:py-20">
      <Container>
        <div className="flex flex-col items-center text-center">
          <a
            href="#home"
            aria-label="Return to the top of the page"
            className="transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A97A3D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#111111]"
          >
            <div className="scale-110">
              <Monogram size="small" />
            </div>
          </a>

          <div className="mx-auto mt-7 h-px w-12 bg-[#A97A3D]" />

          <p className="mt-7 max-w-md font-serif text-3xl leading-tight md:text-4xl">
            We can&apos;t wait to celebrate with you.
          </p>

          <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-neutral-500">
            19 December 2026
          </p>

          <nav
            aria-label="Footer navigation"
            className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] uppercase tracking-[0.25em] text-neutral-400"
          >
            <a
              href="#day"
              className="transition duration-300 hover:text-[#A97A3D] focus-visible:outline-none focus-visible:text-[#A97A3D]"
            >
              The Day
            </a>

            <a
              href="#venue"
              className="transition duration-300 hover:text-[#A97A3D] focus-visible:outline-none focus-visible:text-[#A97A3D]"
            >
              Our Celebration
            </a>

            <a
              href="#travel"
              className="transition duration-300 hover:text-[#A97A3D] focus-visible:outline-none focus-visible:text-[#A97A3D]"
            >
              Travel
            </a>

            <a
              href="#faq"
              className="transition duration-300 hover:text-[#A97A3D] focus-visible:outline-none focus-visible:text-[#A97A3D]"
            >
              FAQs
            </a>

            <a
              href="/rsvp"
              className="transition duration-300 hover:text-[#A97A3D] focus-visible:outline-none focus-visible:text-[#A97A3D]"
            >
              Respond
            </a>
          </nav>

          <div className="mt-14 w-full border-t border-white/10 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 text-[9px] uppercase tracking-[0.22em] text-neutral-600 sm:flex-row">
              <p>humphreywedding.co.uk</p>

              <a
                href="/admin"
                aria-label="Administration"
                className="transition duration-300 hover:text-[#A97A3D] focus-visible:outline-none focus-visible:text-[#A97A3D]"
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