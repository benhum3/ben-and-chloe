export default function Venue() {
  return (
    <section
      id="venue"
      className="bg-[#181818] px-6 py-20 text-[#faf9f7] md:px-20 md:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-neutral-400 md:mb-4 md:text-xs">
  Venue
</p>

<h2 className="font-serif text-4xl leading-none md:text-7xl">
  Our Celebration
</h2>

<p className="mt-6 max-w-2xl text-base leading-7 text-neutral-300 md:mt-8 md:text-lg">
  Our wedding day begins at St Andrew&apos;s Church before we continue the
  celebrations together at Longridge House for drinks, dinner and dancing.
</p>

        <div className="mt-9 grid gap-7 md:mt-14 md:grid-cols-2 md:gap-10">
          <div className="border-t border-neutral-700 pt-5 transition-colors duration-300 hover:border-[#A97A3D]">
            <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-400 md:text-xs">
              Ceremony
            </p>

            <h3 className="mt-3 font-serif text-2xl md:mt-4 md:text-3xl">
              St Andrew&apos;s Church
            </h3>

            <p className="mt-3 text-base leading-7 text-neutral-300 md:mt-4 md:text-sm">
              The ceremony will begin at 12:30pm. Please arrive in good time to
              be seated before the service begins.
            </p>
          </div>

          <div className="border-t border-neutral-700 pt-5 transition-colors duration-300 hover:border-[#A97A3D]">
            <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-400 md:text-xs">
              Reception
            </p>

            <h3 className="mt-3 font-serif text-2xl md:mt-4 md:text-3xl">
              Longridge House
            </h3>

            <p className="mt-3 text-base leading-7 text-neutral-300 md:mt-4 md:text-sm">
              Following the ceremony, guests are invited to continue the
              celebration at Longridge House.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}