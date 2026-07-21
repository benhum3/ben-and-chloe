import Link from "next/link";
import Container from "./Container";

export default function RSVP() {
  return (
    <section className="relative overflow-hidden bg-[#f8f6f2] py-28 md:py-40">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#A97A3D]/10 md:h-[620px] md:w-[620px]"
      />

      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#A97A3D]/10 md:h-[460px] md:w-[460px]"
      />

      <Container>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="text-[11px] uppercase tracking-[0.42em] text-[#A97A3D]">
            Kindly Respond
          </p>

          <h2 className="mt-7 font-serif text-6xl leading-[0.95] md:text-8xl">
            Will you be joining us?
          </h2>

          <p className="mx-auto mt-9 max-w-xl text-sm leading-8 text-neutral-600">
            We would be delighted to celebrate with you. Please let us know
            whether you can attend, along with any dietary requirements and
            your song request for the evening.
          </p>

          <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            Please respond by 1 September 2026
          </p>

          <Link
            href="/rsvp"
            className="mt-10 inline-flex rounded-full border border-[#A97A3D] bg-[#A97A3D] px-10 py-4 text-[11px] uppercase tracking-[0.3em] text-white transition duration-300 hover:bg-transparent hover:text-[#A97A3D]"
          >
            Respond to our invitation
          </Link>
        </div>
      </Container>
    </section>
  );
}