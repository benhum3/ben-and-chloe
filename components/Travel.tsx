import Container from "./Container";

const linkClassName =
  "mt-5 inline-flex border-b border-[#A97A3D] pb-1 text-[10px] uppercase tracking-[0.26em] text-[#A97A3D] transition-colors duration-300 hover:text-[#181818]";

const headingLinkClassName =
  "transition-colors duration-300 hover:text-[#A97A3D]";

export default function Travel() {
  return (
    <section
      id="travel"
      className="scroll-mt-28 bg-[#f4f1eb] py-20 md:py-28"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#A97A3D] md:text-[11px] md:tracking-[0.38em]">
              Travel & Stay
            </p>

            <h2 className="mt-4 max-w-lg font-serif text-4xl leading-[1.05] md:mt-6 md:text-7xl">
              Getting there
            </h2>

            <p className="mt-6 text-base leading-7 text-neutral-600 md:mt-8 md:max-w-md md:text-sm md:leading-8">
              Our ceremony will take place at St Andrew&apos;s Church before we
              continue the celebrations together at Longridge House.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:gap-12">
            <article className="border-t border-[#d9d3c9] pt-6 transition-colors duration-300 hover:border-[#A97A3D]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                Ceremony
              </p>

              <h3 className="mt-3 font-serif text-2xl md:mt-4 md:text-3xl">
                <a
                  href="https://maps.app.goo.gl/igjWWgzQkFk3pheC9"
                  target="_blank"
                  rel="noreferrer"
                  className={headingLinkClassName}
                >
                  St Andrew&apos;s Church
                </a>
              </h3>

              <div className="mt-4 h-px w-12 bg-[#A97A3D]" />

              <p className="mt-4 text-base leading-7 text-neutral-600 md:text-sm">
                Longton, Lancashire
              </p>

              <p className="mt-4 text-base leading-7 text-neutral-600 md:text-sm">
                Please arrive from 12:00pm, allowing plenty of time to be
                seated before the ceremony begins at 12:30pm.
              </p>

              <a
                href="https://maps.app.goo.gl/igjWWgzQkFk3pheC9"
                target="_blank"
                rel="noreferrer"
                className={linkClassName}
              >
                Open in Maps <span className="ml-1">↗</span>
              </a>
            </article>

            <article className="border-t border-[#d9d3c9] pt-6 transition-colors duration-300 hover:border-[#A97A3D]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                Reception
              </p>

              <h3 className="mt-3 font-serif text-2xl md:mt-4 md:text-3xl">
                <a
                  href="https://maps.app.goo.gl/NrS2D5D9DjbPobhQA"
                  target="_blank"
                  rel="noreferrer"
                  className={headingLinkClassName}
                >
                  Longridge House
                </a>
              </h3>

              <div className="mt-4 h-px w-12 bg-[#A97A3D]" />

              <p className="mt-4 text-base leading-7 text-neutral-600 md:text-sm">
                Chipping Lane, Thornley, Chipping, Preston, PR3 2TB
              </p>

              <a
                href="https://maps.app.goo.gl/NrS2D5D9DjbPobhQA"
                target="_blank"
                rel="noreferrer"
                className={linkClassName}
              >
                Open in Maps <span className="ml-1">↗</span>
              </a>
            </article>

            <article className="border-t border-[#d9d3c9] pt-6 transition-colors duration-300 hover:border-[#A97A3D] sm:col-span-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                Accommodation
              </p>

              <h3 className="mt-3 font-serif text-2xl md:mt-4 md:text-3xl">
                <a
                  href="https://www.derbyarmslongridge.co.uk/"
                  target="_blank"
                  rel="noreferrer"
                  className={headingLinkClassName}
                >
                  The Derby Arms
                </a>
              </h3>

              <div className="mt-4 h-px w-12 bg-[#A97A3D]" />

              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 md:text-sm">
                Rooms at Longridge House have been reserved for immediate
                family. For guests wishing to stay nearby, we recommend The
                Derby Arms, just a short drive from the venue.
              </p>

              <a
                href="https://www.derbyarmslongridge.co.uk/"
                target="_blank"
                rel="noreferrer"
                className={linkClassName}
              >
                Visit Website <span className="ml-1">↗</span>
              </a>
            </article>
          </div>
        </div>
      </Container>
    </section>
  );
}
