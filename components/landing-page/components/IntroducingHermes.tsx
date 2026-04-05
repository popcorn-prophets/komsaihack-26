'use client';

import HermesBlack from '@/components/assets/hermes-black.png';
import HermesWhite from '@/components/assets/hermes-white.png';
import Wordmark from '@/components/brand/wordmark';
import { Card, CardContent } from '@/components/ui/card';
import { CardDecorator } from '@/components/ui/card-decorator';
import { Bell, Bot, Globe, Map } from 'lucide-react';
import Image from 'next/image';

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
  return (
    <section
      id="about"
      className="py-20 sm:py-32 -mt-20 relative w-full overflow-hidden"
    >
      {/* Hermes background illustration */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-start">
        <div className="relative h-[800px] w-[680px] -translate-x-[12%] opacity-[0.07] dark:opacity-[0.05]">
          <Image
            src={HermesBlack}
            alt=""
            fill
            className="object-contain dark:hidden"
            aria-hidden
          />
          <Image
            src={HermesWhite}
            alt=""
            fill
            className="hidden object-contain dark:block"
            aria-hidden
          />
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
