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
    <>
      <Navigation />
      <Hero />

      <section id="day" className="scroll-mt-32">
        <Day />
      </section>

      <section id="venue" className="scroll-mt-32">
        <Venue />
      </section>

      <section id="travel" className="scroll-mt-32">
        <Travel />
      </section>

      <section id="faq" className="scroll-mt-32">
        <FAQ />
      </section>

      <RSVP />
      <Footer />
    </>
  );
}