import { AuthButton } from '@/components/auth-button';
import { Suspense } from 'react';
import { ChallengesSection } from './components/ChallengeSection';
import { ContactSection } from './components/ContactSection';
import { CTASection } from './components/CtaSection';
import { FaqSection } from './components/FaqSection';
import { FeatureSection } from './components/FeatureSection';
import Footer from './components/Footer';
import { NewHeroSection as HeroSection } from './components/HeroSection';
import { HowItWorks } from './components/HowItWorks';
import { AboutSection } from './components/IntroducingHermes';
import { Navbar } from './components/NavBar';
import { StatSection } from './components/StatSection';
import { TeamSection } from './components/TeamSection';
import { TestimonialsSection } from './components/Testimonials';
import { WebChatDemoSection } from './components/WebChatDemoSection';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Navbar
          desktopAuthButton={
            <Suspense>
              <AuthButton />
            </Suspense>
          }
          mobileAuthButton={
            <Suspense>
              <AuthButton fullWidth size="lg" />
            </Suspense>
          }
        />
        <HeroSection />
        <WebChatDemoSection />
        <StatSection />
        <ChallengesSection />
        <AboutSection />
        <FeatureSection />
        <HowItWorks />
        <TeamSection />
        <TestimonialsSection />
        <FaqSection />
        <CTASection />
        <ContactSection />
        <Footer />
      </div>
    </main>
  );
}
