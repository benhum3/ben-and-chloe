import Countdown from "./Countdown";
import Monogram from "./Monogram";

export default function Hero() {
  return (
    <section
      id="home"
      className="flex min-h-screen flex-col items-center px-6 pb-16 pt-28 text-center md:justify-center md:py-28"
    >
      <div className="reveal-up delay-100 -mb-2 origin-center scale-[0.82] sm:scale-90 md:mb-0 md:scale-100">
        <Monogram />
      </div>

      <p className="reveal-up delay-200 mb-5 text-[10px] uppercase tracking-[0.36em] text-neutral-500 sm:text-xs md:mb-8 md:tracking-[0.42em]">
        Together with their families
      </p>

      <h1 className="reveal-up delay-300 font-serif text-[2.75rem] leading-none tracking-tight sm:text-5xl md:text-8xl">
        Benjamin

        <span className="my-2 block text-3xl italic text-[#A97A3D] sm:text-4xl md:my-4 md:text-6xl">
          &amp;
        </span>

        Chloe
      </h1>

      <div className="reveal-up delay-400 my-6 flex items-center gap-3 md:my-10 md:gap-4">
        <div className="h-px w-12 bg-[#C9B38A] md:w-16" />

        <span className="font-serif text-base text-[#A97A3D] md:text-xl">
          ◆
        </span>

        <div className="h-px w-12 bg-[#C9B38A] md:w-16" />
      </div>

      <div className="reveal-up delay-500">
        <p className="mx-auto max-w-sm text-[10px] uppercase leading-6 tracking-[0.22em] text-neutral-600 sm:text-xs md:max-w-xl md:text-sm md:leading-8 md:tracking-[0.25em]">
          Request the pleasure of your company

          <span className="block">
            at their wedding celebration
          </span>
        </p>

        <p className="mt-6 text-[10px] uppercase tracking-[0.24em] text-neutral-500 sm:text-xs md:mt-10 md:text-sm md:tracking-[0.28em]">
          Saturday, 19 December 2026
        </p>

        <div className="mt-5 space-y-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500 sm:text-xs md:mt-8 md:space-y-3 md:text-sm md:tracking-[0.25em]">
          <p>St Andrew&apos;s Church · 12:30pm</p>

          <p>Reception at Longridge House</p>
        </div>

          <Countdown />
      </div>

      <div className="reveal-up delay-600 mt-7 md:mt-10">
        <p className="mb-5 text-[10px] uppercase tracking-[0.24em] text-neutral-500 sm:text-xs md:mb-8 md:tracking-[0.28em]">
          We look forward to celebrating with you.
        </p>

        <a
          href="/rsvp"
          className="inline-block min-h-12 border border-[#181818] px-7 py-4 text-[10px] uppercase tracking-[0.28em] transition duration-300 hover:bg-[#181818] hover:text-[#f8f6f2] sm:text-xs md:px-8 md:tracking-[0.3em]"
        >
          Kindly Respond
        </a>
      </div>

      <a
        href="#day"
        className="gentle-float mt-9 text-[9px] uppercase tracking-[0.32em] text-neutral-500 transition hover:text-[#181818] md:mt-14 md:text-[10px] md:tracking-[0.35em]"
      >
        Explore
      </a>
    </section>
  );
}