'use client';

import screenshot1 from '@/components/assets/screenshot1.png';
import screenshot2 from '@/components/assets/screenshot2.png';
import { StepOneIllustration } from '@/components/StepOne';
import { StepThreeIllustration } from '@/components/StepThree';
import { StepTwoIllustration } from '@/components/StepTwo';
import {
  Bell,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Monitor,
  Send,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

function StepFourIllustration() {
  return (
    <div className="flex justify-center items-center">
      <Image
        src={screenshot1}
        alt="Responder Dashboard Laptop"
        width={600}
        height={400}
        className="w-full h-auto drop-shadow-2xl dark:opacity-90"
      />
    </div>
  );
}

function StepFiveIllustration() {
  return (
    <div className="flex justify-center items-center">
      <div className="relative w-full">
        <Image
          src={screenshot2}
          alt="Responder Dashboard"
          width={600}
          height={400}
          className="w-full h-auto rounded-2xl border border-black/5 dark:border-white/10 shadow-2xl"
        />
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/80 dark:bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-black/5 dark:border-white/10">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-slate-900 dark:text-white">
            Live
          </span>
        </div>
      </div>
    </div>
  );
}

const steps = [
  {
    id: 1,
    title: 'Report an Incident',
    description:
      'Send a message through Messenger or Telegram. Describe the situation or use a guided form.',
    icon: Send,
    illustration: StepOneIllustration,
  },
  {
    id: 2,
    title: 'HERMES Organizes the Details',
    description:
      'Your message is automatically converted into a structured report with key information.',
    icon: MessageSquare,
    illustration: StepTwoIllustration,
  },
  {
    id: 3,
    title: 'Review Before Sending',
    description:
      'Check the summarized report and choose to confirm, edit, or cancel before submission.',
    icon: CheckCircle,
    illustration: StepThreeIllustration,
  },
  {
    id: 4,
    title: 'Delivered Instantly',
    description:
      'Confirmed reports appear in real time on the responder dashboard and map.',
    icon: Monitor,
    illustration: StepFourIllustration,
  },
  {
    id: 5,
    title: 'Action and Updates',
    description:
      'Responders take action while you receive confirmations and status updates.',
    icon: Bell,
    illustration: StepFiveIllustration,
  },
];

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const check = () =>
      setIsDark(
        document.documentElement.classList.contains('dark') || mq.matches
      );
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    mq.addEventListener('change', check);
    return () => {
      observer.disconnect();
      mq.removeEventListener('change', check);
    };
  }, []);
  return isDark;
}

export function HowItWorks() {
  const [currentStep, setCurrentStep] = useState(0);
  const isDark = useIsDark();

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextStep, prevStep]);

  const StepIcon = steps[currentStep].icon;
  const Illustration = steps[currentStep].illustration;

  return (
    <section className="-mt-20 py-24 px-6 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors duration-300 relative w-full">
      <div className="max-w-6xl mx-auto w-full">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-balance mb-4">
            From Report to Response
          </h2>
          <p className="text-muted-foreground text-base md:text-lg text-pretty max-w-xl mx-auto">
            Our streamlined process ensures your incident reports reach the
            right responders quickly and efficiently.
          </p>
        </div>

        {/* Slider grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-16"
          style={{ minHeight: 500 }}
        >
          {/* Left: Illustration + glow */}
          <div
            className="relative flex justify-center items-center"
            style={{ height: 500 }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '1.5rem',
                background: isDark
                  ? 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 40%, rgba(255,255,255,0.03) 65%, transparent 80%)'
                  : 'none',
                filter: isDark ? 'blur(24px)' : 'none',
                pointerEvents: 'none',
                zIndex: 0,
                transition: 'opacity 0.3s',
              }}
            />
            <div
              key={currentStep}
              className="relative w-full animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ zIndex: 1 }}
            >
              <Illustration />
            </div>
          </div>

          {/* Right: Content — fixed height so it never shifts */}
          <div className="flex flex-col justify-center" style={{ height: 500 }}>
            <div className="flex flex-col space-y-8">
              <div className="space-y-6">
                {/* Updated Step badge to match uploaded icon style */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 bg-[#fcfcfc] dark:bg-white/5 rounded-[22%] border border-black/5 dark:border-white/10 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] dark:shadow-none">
                    <StepIcon
                      className="w-6 h-6 text-slate-500 dark:text-white/80"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-[0.2em]">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground text-balance">
                  {steps[currentStep].title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-base md:text-lg text-pretty max-w-md leading-relaxed">
                  {steps[currentStep].description}
                </p>
              </div>

              {/* Pagination Dots */}
              <div className="flex gap-2 items-center">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? 'w-10 bg-slate-900 dark:bg-white'
                        : 'w-2 bg-slate-200 dark:bg-white/20 hover:bg-slate-300 dark:hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={prevStep}
                  className="p-4 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm"
                  aria-label="Previous step"
                >
                  <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-white/70" />
                </button>
                <button
                  onClick={nextStep}
                  className="p-4 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm"
                  aria-label="Next step"
                >
                  <ChevronRight className="w-6 h-6 text-slate-600 dark:text-white/70" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
