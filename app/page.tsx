import LandingHeader from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
      </main>
      <LandingFooter />
    </div>
  );
}
