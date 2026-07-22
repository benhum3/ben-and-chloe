export default function Day() {
  const events = [
    {
      title: "Guest Arrival",
      time: "12:00 PM",
      detail: "Please arrive in good time before the ceremony begins.",
    },
    {
      title: "Ceremony Begins",
      time: "12:30 PM",
      detail: "St Andrew's Church",
    },
    {
      title: "Reception Drinks",
      time: "2:00 PM",
      detail: "Longridge House",
    },
    {
      title: "Wedding Breakfast",
      time: "4:00 PM",
      detail: "Dinner and speeches",
    },
    {
      title: "Evening Reception",
      time: "7:00 PM",
      detail: "Music, drinks and dancing",
    },
    {
      title: "Carriages",
      time: "12:00 AM",
      detail: "Time to say goodbye.",
    },
  ];

  return (
    <section id="day" className="px-6 py-20 md:px-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-neutral-500 md:mb-4 md:text-xs">
          The Day
        </p>

        <h2 className="font-serif text-4xl leading-none md:text-7xl">
          Saturday, 19 December
        </h2>

        <div className="mt-10 grid gap-6 md:mt-16 md:grid-cols-2 md:gap-10 xl:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.title}
              className="border-t border-neutral-300 pt-5 transition-colors duration-300 hover:border-[#A97A3D]"
            >
              <h3 className="font-serif text-2xl md:text-3xl">
                {event.title}
              </h3>

              <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-[#A97A3D] md:text-xs">
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