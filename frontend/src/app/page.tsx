"use client";

import { TakaHero } from "@/components/hero";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TrustedVendors } from "@/components/landing/TrustedVendors";
import { TopBuilds } from "@/components/landing/TopBuilds";
import { FeaturedOffers } from "@/components/landing/FeaturedOffers";
import { WhyPCLagbe } from "@/components/landing/WhyPCLagbe";
import { Testimonials } from "@/components/landing/Testimonials";
import { TechHeadlines } from "@/components/landing/TechHeadlines";
import { LiveActivityFeed } from "@/components/landing/LiveActivityFeed";
import { UpcomingFeatures } from "@/components/landing/UpcomingFeatures";
import { ReferralTeaser } from "@/components/landing/ReferralTeaser";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="bg-black min-h-screen">
      <TakaHero />
      <FeaturesSection />
      <HowItWorks />
      <TrustedVendors />
      <TopBuilds />
      <FeaturedOffers />
      <WhyPCLagbe />
      <Testimonials />
      <TechHeadlines />
      <LiveActivityFeed />
      <UpcomingFeatures />
      <ReferralTeaser />
      <CTASection />
      <Footer />
    </main>
  );
}
