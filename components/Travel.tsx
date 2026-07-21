import Container from "./Container";

export default function Travel() {
  return (
    <section
      id="travel"
      className="scroll-mt-28 bg-[#f4f1eb] py-24 md:py-32"
    >
      <Container>
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="text-[11px] uppercase tracking-[0.38em] text-[#A97A3D]">
              Travel & Stay
            </p>

            <h2 className="mt-6 max-w-lg font-serif text-5xl leading-[1.05] md:text-7xl">
              Getting there
            </h2>

            <p className="mt-8 max-w-md text-sm leading-8 text-neutral-600">
              The ceremony will take place at St Andrew&apos;s Church in
              Longton, followed by the reception at Longridge House near
              Chipping.
            </p>
          </div>

          <div className="grid gap-12 sm:grid-cols-2">
            <article className="border-t border-[#d9d3c9] pt-7">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                Ceremony
              </p>

              <h3 className="mt-5 font-serif text-3xl">
                St Andrew&apos;s Church
              </h3>

              <p className="mt-5 text-sm leading-7 text-neutral-600">
                Longton, Lancashire
              </p>

              <p className="mt-5 text-sm leading-7 text-neutral-600">
                Please arrive from 12:00pm, allowing plenty of time to be
                seated before the ceremony begins at 12:30pm.
              </p>
            </article>

            <article className="border-t border-[#d9d3c9] pt-7">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                Reception
              </p>

              <h3 className="mt-5 font-serif text-3xl">
                Longridge House
              </h3>

              <p className="mt-5 text-sm leading-7 text-neutral-600">
                Chipping Lane, Thornley, Chipping, Preston, PR3 2TB
              </p>

              <a
                href="https://maps.google.com/?q=Longridge+House+Chipping+Lane+Thornley+Chipping+Preston+PR3+2TB"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex border-b border-[#A97A3D] pb-1 text-[10px] uppercase tracking-[0.26em] text-[#A97A3D] transition hover:text-[#181818]"
              >
                Open in maps
              </a>
            </article>

            <article className="border-t border-[#d9d3c9] pt-7 sm:col-span-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                Accommodation
              </p>

              <h3 className="mt-5 font-serif text-3xl">
                Staying nearby
              </h3>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-600">
                Rooms at Longridge House have been reserved for immediate
                family. For guests looking to stay nearby, The Derby Arms is a
                convenient local option.
              </p>

              <a
                href="https://maps.google.com/?q=The+Derby+Arms+Longridge"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex border-b border-[#A97A3D] pb-1 text-[10px] uppercase tracking-[0.26em] text-[#A97A3D] transition hover:text-[#181818]"
              >
                View nearby accommodation
              </a>
            </article>
          </div>
        </div>
      </Container>
    </section>
  );
}