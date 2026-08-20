import Container from "./Container";

const linkClassName =
  "mt-5 inline-flex items-center gap-1.5 border-b border-[#d2a641] pb-1 text-[10px] uppercase tracking-[0.26em] text-[var(--gold-text)] transition-colors duration-300 hover:text-[#181818] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#d2a641]";

const headingLinkClassName =
  "rounded-sm transition-colors duration-300 hover:text-[var(--gold-text)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#d2a641]";

const CHURCH_MAP = "https://maps.app.goo.gl/igjWWgzQkFk3pheC9";
const RECEPTION_MAP = "https://maps.app.goo.gl/NrS2D5D9DjbPobhQA";
const BETWEEN_VENUES =
  "https://www.google.com/maps/dir/?api=1&origin=St+Andrew%27s+Church%2C+Longton%2C+Lancashire&destination=Longridge+House%2C+Chipping+Lane%2C+Thornley%2C+Preston+PR3+2TB&travelmode=driving";

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      fill="none"
      className="h-3 w-3 shrink-0"
    >
      <path
        d="M3 9 9 3M4 3h5v5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      fill="none"
      className="h-3 w-3 shrink-0"
    >
      <path
        d="M6 1.75v7M3.5 6.75 6 9.25l2.5-2.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Travel() {
  return (
    <section
      id="travel"
      data-wedding-day-practical
      className="scroll-mt-28 bg-[#f4f1eb] py-20 md:py-28"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold-text)] md:text-[11px] md:tracking-[0.38em]">
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
            <article className="border-t border-[#d9d3c9] pt-6 transition-colors duration-300 hover:border-[#d2a641]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                Ceremony
              </p>

              <h3 className="mt-3 font-serif text-2xl md:mt-4 md:text-3xl">
                <a
                  href={CHURCH_MAP}
                  target="_blank"
                  rel="noreferrer"
                  className={headingLinkClassName}
                >
                  St Andrew&apos;s Church
                </a>
              </h3>

              <div className="mt-4 h-px w-12 bg-[#d2a641]" />

              <p className="mt-4 text-base leading-7 text-neutral-600 md:text-sm">
                Longton, Lancashire
              </p>

              <p className="mt-4 text-base leading-7 text-neutral-600 md:text-sm">
                Please arrive from 12:00pm, allowing plenty of time to be
                seated before the ceremony begins at 12:30pm.
              </p>

              <p className="mt-4 text-base leading-7 text-neutral-600 md:text-sm">
                Parking is available on-street along School Lane, which runs
                down the side of the church. Please park considerately and
                allow a little extra time to find a space.
              </p>

              <a
                href={CHURCH_MAP}
                target="_blank"
                rel="noreferrer"
                className={linkClassName}
              >
                Open in Maps <ExternalLinkIcon />
              </a>
            </article>

            <article className="border-t border-[#d9d3c9] pt-6 transition-colors duration-300 hover:border-[#d2a641]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                Reception
              </p>

              <h3 className="mt-3 font-serif text-2xl md:mt-4 md:text-3xl">
                <a
                  href={RECEPTION_MAP}
                  target="_blank"
                  rel="noreferrer"
                  className={headingLinkClassName}
                >
                  Longridge House
                </a>
              </h3>

              <div className="mt-4 h-px w-12 bg-[#d2a641]" />

              <p className="mt-4 text-base leading-7 text-neutral-600 md:text-sm">
                Chipping Lane, Thornley, Chipping, Preston, PR3 2TB
              </p>

              <p className="mt-4 text-base leading-7 text-neutral-600 md:text-sm">
                The reception follows the church ceremony. Please make your
                own travel arrangements from the church to Longridge House.
              </p>

              <p className="mt-4 text-base leading-7 text-neutral-600 md:text-sm">
                On-site parking is available at Longridge House.
              </p>

              <a
                href={RECEPTION_MAP}
                target="_blank"
                rel="noreferrer"
                className={linkClassName}
              >
                Open in Maps <ExternalLinkIcon />
              </a>
            </article>

            <article className="border-t border-[#d9d3c9] pt-6 transition-colors duration-300 hover:border-[#d2a641] sm:col-span-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                Between the venues
              </p>

              <h3 className="mt-3 font-serif text-2xl md:mt-4 md:text-3xl">
                Plan your onward journey
              </h3>

              <div className="mt-4 h-px w-12 bg-[#d2a641]" />

              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 md:text-sm">
                You can preview the journey from St Andrew&apos;s Church to
                Longridge House below. If you intend to use a taxi for the
                evening, booking it ahead of the wedding is advisable.
              </p>

              <div className="flex flex-wrap gap-x-7 gap-y-2">
                <a
                  href={BETWEEN_VENUES}
                  target="_blank"
                  rel="noreferrer"
                  className={linkClassName}
                >
                  View route <ExternalLinkIcon />
                </a>

                <a href="/api/calendar?type=day" className={linkClassName}>
                  Day guest calendar <DownloadIcon />
                </a>

                <a href="/api/calendar?type=evening" className={linkClassName}>
                  Evening guest calendar <DownloadIcon />
                </a>
              </div>
            </article>

            <article className="border-t border-[#d9d3c9] pt-6 transition-colors duration-300 hover:border-[#d2a641] sm:col-span-2">
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

              <div className="mt-4 h-px w-12 bg-[#d2a641]" />

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
                Visit Website <ExternalLinkIcon />
              </a>
            </article>

          </div>
        </div>
      </Container>
    </section>
  );
}
