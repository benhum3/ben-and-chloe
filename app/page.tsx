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
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[100] rounded-sm bg-[#181818] px-4 py-3 text-xs uppercase tracking-[0.2em] text-white focus:not-sr-only"
      >
        Skip to invitation
      </a>
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
