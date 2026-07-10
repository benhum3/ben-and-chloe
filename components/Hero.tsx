import Countdown from "./Countdown";
import Monogram from "./Monogram";

export default function Hero() {
  return (
    <section
      id="home"
      className="flex min-h-screen flex-col items-center justify-center px-6 py-28 text-center"
    >
      <div className="reveal-up delay-100">
        <Monogram />
      </div>

      <p className="reveal-up delay-200 mb-8 text-xs uppercase tracking-[0.42em] text-neutral-500">
        Together with their families
      </p>

      <h1 className="reveal-up delay-300 font-serif text-5xl leading-none tracking-tight sm:text-6xl md:text-8xl">
        Benjamin
        <span className="my-4 block text-4xl italic text-[#A97A3D] md:text-6xl">
          &amp;
        </span>
        Chloe
      </h1>

      <div className="reveal-up delay-400 my-10 flex items-center gap-4">
        <div className="h-px w-16 bg-[#C9B38A]" />
        <span className="font-serif text-xl text-[#A97A3D]">◆</span>
        <div className="h-px w-16 bg-[#C9B38A]" />
      </div>

      <div className="reveal-up delay-500">
        <p className="max-w-xl text-sm uppercase leading-8 tracking-[0.25em] text-neutral-600">
          Request the pleasure of your company
          <span className="block">at their wedding celebration</span>
        </p>

        <p className="mt-10 text-sm uppercase tracking-[0.28em] text-neutral-500">
          Saturday, 19 December 2026
        </p>

        <div className="mt-8 space-y-3 text-sm uppercase tracking-[0.25em] text-neutral-500">
          <p>St Andrew&apos;s Church · 12:30pm</p>
          <p>Reception at Longridge House</p>
        </div>

        <Countdown />
      </div>

      <div className="reveal-up delay-600 mt-10">
        <p className="mb-8 text-xs uppercase tracking-[0.28em] text-neutral-500">
          We look forward to celebrating with you.
        </p>

        <a
          href="/rsvp"
          className="inline-block border border-[#181818] px-8 py-4 text-xs uppercase tracking-[0.3em] transition duration-300 hover:bg-[#181818] hover:text-[#f8f6f2]"
        >
          Kindly Respond
        </a>
      </div>

      <a
        href="#day"
        className="gentle-float mt-14 text-[10px] uppercase tracking-[0.35em] text-neutral-500 transition hover:text-[#181818]"
      >
        Explore
      </a>
    </section>
  );
}