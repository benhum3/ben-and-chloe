import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Day from "@/components/Day";
import Venue from "@/components/Venue";
import Travel from "@/components/Travel";
import FAQ from "@/components/FAQ";
import RSVP from "@/components/RSVP";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import MobileRSVP from "@/components/MobileRSVP";
import WeddingMode from "@/components/WeddingMode";
import PhotoGallery from "@/components/PhotoGallery";

export default function Home() {
  return (
    <main>
      <Navigation />
      <PhotoGallery />
      <WeddingMode />
      <Hero />
      <Day />
      <Venue />
      <Travel />
      <FAQ />
      <Contact />
      <RSVP />
      <Footer />
      <MobileRSVP />
    </main>
  );
}
