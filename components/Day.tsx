export default function Day() {
  return (
    <section id="day" className="px-6 py-28 md:px-20">
      <div className="mx-auto max-w-5xl">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-neutral-500">
          The Day
        </p>

        <h2 className="font-serif text-5xl md:text-7xl">
          Saturday, 19 December
        </h2>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {[
            ["12:30", "Ceremony", "St Andrew’s Church"],
            ["Afterwards", "Reception", "Longridge House"],
            ["Evening", "Celebration", "Dinner, drinks and dancing"],
          ].map(([time, title, detail]) => (
            <div key={title} className="border-t border-neutral-300 pt-6">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                {time}
              </p>
              <h3 className="mt-4 font-serif text-3xl">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-neutral-600">
                {detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}