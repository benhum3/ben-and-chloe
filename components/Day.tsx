export default function Day() {
  const events = [
    {
      title: "Guest Arrival",
      time: "12:00pm",
      detail: "Please arrive in good time before the ceremony begins.",
    },
    {
      title: "Ceremony Begins",
      time: "12:30pm",
      detail: "St Andrew's Church",
    },
    {
      title: "Reception Drinks",
      time: "2:00pm",
      detail: "Longridge House",
    },
    {
      title: "Wedding Breakfast",
      time: "4:00pm",
      detail: "Dinner and speeches",
    },
    {
      title: "Evening Reception",
      time: "7:00pm",
      detail: "Music, drinks and dancing",
    },
    {
      title: "Carriages",
      time: "Midnight",
      detail: "Time to say goodbye.",
    },
  ];

  return (
    <section
      id="day"
      data-wedding-day-practical
      className="scroll-mt-28 px-6 py-20 md:px-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-neutral-500 md:mb-4 md:text-xs">
          The Day
        </p>

        <h2 className="font-serif text-4xl leading-none md:text-7xl">
          Saturday, 19 December
        </h2>

        <a
          href="/api/calendar"
          className="mt-6 inline-flex items-center gap-2 border-b border-[#d2a641] pb-1 text-[10px] uppercase tracking-[0.26em] text-[var(--gold-text)] transition-colors duration-300 hover:text-[#181818] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#d2a641] md:mt-8"
        >
          Add the day to your calendar
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
        </a>

        <div className="mt-10 grid gap-6 md:mt-16 md:grid-cols-2 md:gap-10 xl:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.title}
              className="border-t border-neutral-300 pt-5 transition-colors duration-300 hover:border-[#d2a641]"
            >
              <h3 className="font-serif text-2xl md:text-3xl">
                {event.title}
              </h3>

              <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-[var(--gold-text)] md:text-xs">
                {event.time}
              </p>

              <p className="mt-4 text-base leading-7 text-neutral-600 md:text-sm">
                {event.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
