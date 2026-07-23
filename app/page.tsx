import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Day from "@/components/Day";
import Venue from "@/components/Venue";
import Travel from "@/components/Travel";
import FAQ from "@/components/FAQ";
import RSVP from "@/components/RSVP";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />
      <Day />
      <Venue />
      <Travel />
      <FAQ />
      <RSVP />
      <Footer />
    </main>
  );
}
