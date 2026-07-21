import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import Day from "../components/Day";
import Venue from "../components/Venue";
import Travel from "../components/Travel";
import FAQ from "../components/FAQ";
import RSVP from "../components/RSVP";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main id="home" className="overflow-x-hidden text-[#181818]">
      <Navigation />

      <Hero />

      <div id="day" className="scroll-mt-28">
        <Day />
      </div>

      <div id="venue" className="scroll-mt-28">
        <Venue />
      </div>

      <Travel />
      <FAQ />
      <RSVP />
      <Footer />
    </main>
  );
}