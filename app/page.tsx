import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import Day from "../components/Day";
import Venue from "../components/Venue";
import RSVP from "../components/RSVP";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="bg-[#faf9f7] text-[#181818]">
      <Navigation />
      <Hero />
      <Day />
      <Venue />
      <RSVP />
      <Footer />
    </main>
  );
}