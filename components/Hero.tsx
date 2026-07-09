import Countdown from "./Countdown";

export default function Hero() {
  return (
    <section
      id="home"
      className="animate-fade-in flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center"
    >
      <p className="mb-8 text-xs uppercase tracking-[0.45em] text-neutral-500">
        Together with their families
      </p>

      <h1 className="font-serif text-5xl leading-none tracking-tight sm:text-6xl md:text-8xl">
        Benjamin
        <span className="my-4 block text-4xl italic md:text-6xl">&amp;</span>
        Chloe
      </h1>

      <div className="my-10 h-px w-28 bg-[#c9b38a]" />

      <p className="max-w-xl text-sm uppercase leading-8 tracking-[0.28em] text-neutral-600">
        Request the pleasure of your company
        <span className="block">on Saturday, 19 December 2026</span>
      </p>

      <p className="mt-8 text-sm uppercase tracking-[0.3em] text-neutral-500">
        St Andrew&apos;s Church · 12:30pm
      </p>

      <p className="mt-3 text-sm uppercase tracking-[0.3em] text-neutral-500">
        Reception at Longridge House
      </p>

      <Countdown />

      <div className="mt-12 text-xs uppercase tracking-[0.35em] text-neutral-500">
        Formal Attire
      </div>
    </section>
  );
}
