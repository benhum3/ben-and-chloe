export default function Navigation() {
  return (
    <nav className="fixed left-0 top-0 z-50 flex w-full items-center justify-between px-6 py-5 text-xs uppercase tracking-[0.25em] md:px-12">
      <a href="#home">B & C</a>

      <div className="hidden gap-8 md:flex">
        <a href="#day">The Day</a>
        <a href="#venue">Venue</a>
        <a href="#rsvp">RSVP</a>
      </div>
    </nav>
  );
}