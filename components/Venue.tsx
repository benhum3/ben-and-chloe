export default function Venue() {
  return (
    <section id="venue" className="bg-[#181818] px-6 py-28 text-[#faf9f7] md:px-20">
      <div className="mx-auto max-w-5xl">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-neutral-400">
          Venue
        </p>

        <h2 className="font-serif text-5xl md:text-7xl">
          St Andrew&apos;s Church
          <span className="block">& Longridge House</span>
        </h2>

        <div className="mt-14 grid gap-10 md:grid-cols-2">
          <div className="border-t border-neutral-700 pt-6">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
              Ceremony
            </p>
            <h3 className="mt-4 font-serif text-3xl">St Andrew&apos;s Church</h3>
            <p className="mt-4 text-sm leading-7 text-neutral-300">
              The ceremony will begin at 12:30pm. Please arrive in good time to
              be seated before the service begins.
            </p>
          </div>

          <div className="border-t border-neutral-700 pt-6">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
              Reception
            </p>
            <h3 className="mt-4 font-serif text-3xl">Longridge House</h3>
            <p className="mt-4 text-sm leading-7 text-neutral-300">
              Following the ceremony, guests are invited to continue the
              celebration at Longridge House.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}