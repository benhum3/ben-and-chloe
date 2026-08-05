import Container from "./Container";

export default function Contact() {
  return (
    <section
      id="contact"
      data-wedding-day-practical
      className="scroll-mt-28 bg-[#f4f1eb] py-20 md:py-28"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold-text)] md:text-[11px]">
              Get in touch
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-[1.05] md:mt-6 md:text-7xl">
              Any questions?
            </h2>
          </div>

          <div className="border-t border-[#d9d3c9] pt-6 md:pt-8">
            <p className="max-w-2xl text-base leading-8 text-neutral-600 md:text-lg">
              If there is anything we have not covered, please get in touch
              with us by email and we will get back to you as soon as we can.
            </p>

            <a
              href="mailto:humphreywedding26@yahoo.com"
              className="mt-7 inline-flex border-b border-[#d2a641] pb-1 font-serif text-2xl text-[#181818] transition-colors duration-300 hover:text-[var(--gold-text)] focus-visible:outline-none focus-visible:text-[var(--gold-text)] md:text-3xl"
            >
              humphreywedding26@yahoo.com
            </a>

            <p className="mt-7 text-[10px] uppercase tracking-[0.28em] text-neutral-500">
              Please include your name when leaving a message.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
