'use client';

import PhilippinesBlack from '@/components/assets/philippines-black.png';
import PhilippinesWhite from '@/components/assets/philippines-white.png';
import { NumberTicker } from '@/components/ui/number-ticker';
import Image from 'next/image';

const disasterFacts = [
  {
    value: 20,
    suffix: '+',
    label: 'Typhoons per Year',
    description:
      'The Philippines experiences an average of 20 typhoons annually, making it one of the most storm-prone countries.',
  },
  {
    value: 33000,
    suffix: '+',
    label: 'Earthquakes since 2019',
    description:
      'Located along the Pacific Ring of Fire, the country records thousands of earthquakes each year.',
  },
  {
    value: 10000,
    suffix: '+',
    label: 'Flood Events',
    description:
      'Flash floods and storm surges affect millions of Filipinos, especially in low-lying areas.',
  },
  {
    value: 109,
    suffix: 'M',
    label: 'People at Risk',
    description:
      'The entire population is vulnerable to natural disasters, requiring robust emergency response systems.',
  },
];

export function StatSection() {
  return (
    <section className="relative -mt-32 w-full overflow-hidden">
      <style>{`
        .stat-grid::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px);
          background-size: 40px 40px;
          background-position: top center;
        }
        .dark .stat-grid::before {
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px);
        }
        .stat-grid::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, hsl(var(--background)) 100%);
          pointer-events: none;
        }
      `}</style>

      <div className="stat-grid absolute inset-0" />

      <div className="relative z-10 w-full px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 max-w-7xl mx-auto">
          {/* LEFT: 2x2 Stats Cards Grid */}
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4 md:gap-6">
            {disasterFacts.map((fact, index) => (
              <div
                key={index}
                className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-foreground/20 hover:shadow-lg hover:shadow-foreground/5"
              >
                <div className="mb-3">
                  <span className="text-4xl md:text-5xl font-bold tracking-tight">
                    <NumberTicker
                      value={fact.value}
                      suffix={fact.suffix}
                      duration={2500}
                      delay={index * 150}
                    />
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{fact.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {fact.description}
                </p>
              </div>
            ))}
          </div>

          {/* RIGHT: Philippine Map — hidden on mobile */}
          <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.03] via-foreground/[0.08] to-foreground/[0.03] blur-3xl scale-150" />
              <Image
                src={PhilippinesBlack}
                alt="Map of the Philippines"
                width={550}
                height={825}
                className="relative block dark:hidden drop-shadow-[0_0_50px_rgba(0,0,0,0.2)] w-[280px] h-auto md:w-[380px] lg:w-[460px]"
              />
              <Image
                src={PhilippinesWhite}
                alt="Map of the Philippines"
                width={550}
                height={825}
                className="relative hidden dark:block drop-shadow-[0_0_50px_rgba(255,255,255,0.25)] w-[280px] h-auto md:w-[380px] lg:w-[460px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
