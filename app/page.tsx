import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import LandingNav from "@/components/landing/LandingNav";
import {
  ClosingBand,
  Comparison,
  ForLabs,
  HowItWorks,
  PhoneAndLaptop,
  Privacy,
  TrustStrip,
} from "@/components/landing/Sections";

// Public landing page. Signed-in visitors are sent to /today by proxy.ts.
export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Comparison />
        <PhoneAndLaptop />
        <Privacy />
        <ForLabs />
        <ClosingBand />
      </main>
      <Footer />
    </>
  );
}
