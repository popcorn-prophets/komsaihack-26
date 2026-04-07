'use client';

import HermesBlack from '@/components/assets/hermes-black.png';
import HermesWhite from '@/components/assets/hermes-white.png';
import Wordmark from '@/components/brand/wordmark';
import { Card, CardContent } from '@/components/ui/card';
import { CardDecorator } from '@/components/ui/card-decorator';
import { Bell, Bot, Globe, Map } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const values = [
  {
    icon: Bot,
    title: 'AI-Powered Parsing',
    description:
      'Unstructured citizen messages are automatically converted into structured incident reports using LLM and NLP technology — no manual sorting required.',
  },
  {
    icon: Globe,
    title: 'Multi-Platform Integration',
    description:
      'Residents can report incidents through familiar platforms like Telegram and Messenger, with no new apps to install.',
  },
  {
    icon: Map,
    title: 'Real-Time Situational Awareness',
    description:
      'M/CDRRMO officers get a live feed of incoming reports with map-based visualization, filtering, and categorization tools.',
  },
  {
    icon: Bell,
    title: 'Rapid Dissemination',
    description:
      'Send targeted advisories and alerts to residents by location or incident type — instantly, through the same channels they already use.',
  },
];

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [hasSettled, setHasSettled] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEntered) {
          setHasEntered(true);
          observer.disconnect();
          setTimeout(() => setHasSettled(true), 1050);
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [hasEntered]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-20 sm:py-32 -mt-20 relative w-full overflow-hidden"
    >
      <style>{`
        @keyframes hermes-enter {
          0% {
            transform: translateX(-140%) translateY(80px);
            opacity: 0;
          }
          55% {
            transform: translateX(-8%) translateY(-6px);
            opacity: 1;
          }
          70% {
            transform: translateX(-10%) translateY(3px);
            opacity: 1;
          }
          100% {
            transform: translateX(-12%) translateY(0px);
            opacity: 1;
          }
        }

        @keyframes hermes-float {
          0%, 100% {
            transform: translateX(-12%) translateY(0px);
          }
          50% {
            transform: translateX(-12%) translateY(-18px);
          }
        }

        @keyframes hermes-glow-in {
          0% {
            filter:
              drop-shadow(0 0 0px transparent)
              drop-shadow(0 0 0px transparent)
              drop-shadow(0 0 0px transparent);
          }
          100% {
            filter:
              drop-shadow(0 0 25px rgba(148, 163, 184, 0.9))
              drop-shadow(0 0 60px rgba(148, 163, 184, 0.6))
              drop-shadow(0 0 100px rgba(148, 163, 184, 0.35));
          }
        }

        @keyframes hermes-glow-pulse {
          0%, 100% {
            filter:
              drop-shadow(0 0 20px rgba(148, 163, 184, 0.85))
              drop-shadow(0 0 55px rgba(148, 163, 184, 0.55))
              drop-shadow(0 0 90px rgba(148, 163, 184, 0.3));
          }
          50% {
            filter:
              drop-shadow(0 0 35px rgba(148, 163, 184, 1))
              drop-shadow(0 0 80px rgba(148, 163, 184, 0.75))
              drop-shadow(0 0 130px rgba(148, 163, 184, 0.45));
          }
        }

        @keyframes hermes-glow-in-dark {
          0% {
            filter:
              drop-shadow(0 0 0px transparent)
              drop-shadow(0 0 0px transparent)
              drop-shadow(0 0 0px transparent);
          }
          100% {
            filter:
              drop-shadow(0 0 25px rgba(226, 232, 240, 0.8))
              drop-shadow(0 0 60px rgba(226, 232, 240, 0.5))
              drop-shadow(0 0 100px rgba(226, 232, 240, 0.28));
          }
        }

        @keyframes hermes-glow-pulse-dark {
          0%, 100% {
            filter:
              drop-shadow(0 0 20px rgba(226, 232, 240, 0.75))
              drop-shadow(0 0 55px rgba(226, 232, 240, 0.45))
              drop-shadow(0 0 90px rgba(226, 232, 240, 0.25));
          }
          50% {
            filter:
              drop-shadow(0 0 35px rgba(226, 232, 240, 0.95))
              drop-shadow(0 0 80px rgba(226, 232, 240, 0.65))
              drop-shadow(0 0 130px rgba(226, 232, 240, 0.38));
          }
        }

        .hermes-enter {
          animation:
            hermes-enter 1s cubic-bezier(0.22, 1, 0.36, 1) forwards,
            hermes-float 6s ease-in-out 1s infinite;
        }

        .hermes-glow {
          animation: hermes-glow-in 0.8s ease-out forwards;
        }

        .hermes-glow-float {
          animation: hermes-glow-pulse 6s ease-in-out infinite;
        }

        .dark .hermes-glow {
          animation: hermes-glow-in-dark 0.8s ease-out forwards;
        }

        .dark .hermes-glow-float {
          animation: hermes-glow-pulse-dark 6s ease-in-out infinite;
        }
      `}</style>

      {/* Hermes background illustration */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-start">
        <div
          className={[
            'relative h-[800px] w-[680px]',
            hasSettled ? 'hermes-glow-float' : '',
            !hasSettled && hasEntered ? 'hermes-glow' : '',
            !hasEntered ? 'invisible' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div
            className={['absolute inset-0', hasEntered ? 'hermes-enter' : '']
              .filter(Boolean)
              .join(' ')}
          >
            <div className="absolute inset-0 dark:hidden">
              <Image
                src={HermesBlack}
                alt=""
                fill
                className="object-contain opacity-[0.09]"
                aria-hidden
              />
            </div>
            <div className="absolute inset-0 hidden dark:block">
              <Image
                src={HermesWhite}
                alt=""
                fill
                className="object-contain opacity-[0.07]"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Introducing
          </h2>
          <div className="flex h-28 justify-center mb-4">
            <Wordmark />
          </div>
          <p className="text-lg text-muted-foreground mb-8">
            HERMES is a centralized disaster communication control center that
            connects residents and responders through the platforms they already
            use.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 mb-12">
          {values.map((value, index) => (
            <Card key={index} className="group shadow-xs py-2">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <CardDecorator>
                    <value.icon className="h-6 w-6" aria-hidden />
                  </CardDecorator>
                  <h3 className="mt-6 font-medium text-balance">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground mt-3 text-sm">
                    {value.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
