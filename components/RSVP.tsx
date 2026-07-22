import Link from "next/link";
import Container from "./Container";

export default function RSVP() {
  return (
    <section className="relative overflow-hidden bg-[#f8f6f2] py-20 md:py-28">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#A97A3D]/10 md:h-[700px] md:w-[700px]"
      />

      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#A97A3D]/10 md:h-[520px] md:w-[520px]"
      />

      <Container>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="text-[10px] uppercase tracking-[0.38em] text-[#A97A3D] md:text-[11px] md:tracking-[0.42em]">
            Kindly Respond
          </p>

          <div className="mx-auto mt-5 h-px w-12 bg-[#A97A3D]" />

          <h2 className="mt-7 font-serif text-5xl leading-[0.95] md:text-8xl">
            Will you be joining us?
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-neutral-600 md:mt-9 md:text-sm md:leading-8">
            We can&apos;t wait to celebrate with you. Please let us know
            whether you&apos;ll be joining us, along with any dietary
            requirements and your favourite song to get everyone on the dance
            floor.
          </p>

          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Kindly respond by
            </p>

            <p className="mt-2 font-serif text-2xl text-[#181818]">
              1 September 2026
            </p>

            <p className="mt-3 text-sm text-neutral-500">
              It only takes a couple of minutes.
            </p>
          </div>

          <Link
            href="/rsvp"
            className="mt-8 inline-flex rounded-full border border-[#A97A3D] bg-[#A97A3D] px-10 py-4 text-[11px] uppercase tracking-[0.3em] text-white transition duration-300 hover:bg-transparent hover:text-[#A97A3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A97A3D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f8f6f2] md:mt-10"
          >
            Complete RSVP
          </Link>
        </div>
      </Container>
    </section>
  );
}