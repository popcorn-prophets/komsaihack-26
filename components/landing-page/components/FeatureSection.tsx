'use client';

import HermesNetwork from '@/components/HermesNetwork';
import type { LucideProps } from 'lucide-react';
import {
  Bell,
  Bot,
  Brain,
  FileText,
  Filter,
  Globe,
  Map,
  MessageSquare,
  Pencil,
  Shield,
  Target,
  Zap,
} from 'lucide-react';
import Image, { StaticImageData } from 'next/image';
import type { ComponentType } from 'react';

// Local image imports
import mockLaptop from '@/components/assets/mock-laptop.png';
import mockPhone from '@/components/assets/mock-phone.png';

type Feature = {
  icon: ComponentType<LucideProps>;
  title: string;
  description: string;
};

type FeatureSection = {
  id: string;
  headline: string;
  subtext: string;
  features: Feature[];
  image?: string | StaticImageData;
  imageAlt?: string;
  imagePosition: 'left' | 'right';
  customIllustration?: boolean;
};

const featureSections: FeatureSection[] = [
  {
    id: 'messaging',
    headline: 'Turn messages into structured incident reports.',
    subtext:
      'Project HERMES enables residents and responders to communicate through chat, automatically transforming unstructured messages—including multimedia—into structured incident reports using LLM and NLP technologies.',
    features: [
      {
        icon: MessageSquare,
        title: 'Messaging Platform Integration',
        description:
          'Bi-directional communication via Telegram and/or Messenger between residents and responders',
      },
      {
        icon: Bot,
        title: 'Chatbot Interface',
        description:
          'Guided reporting experience for submitting and responding to incidents',
      },
      {
        icon: Brain,
        title: 'LLM/NLP Incident Parsing Engine',
        description:
          'Converts free-form text into structured data (type, location, time, severity, description)',
      },
      {
        icon: Globe,
        title: 'Multilingual & Multimedia Input',
        description:
          'Supports English and Filipino, with image and voice inputs for richer reports',
      },
    ],
    image: mockPhone,
    imageAlt: 'HERMES Messenger chatbot interface showing incident reporting',
    imagePosition: 'right' as const,
  },
  {
    id: 'monitoring',
    headline: 'Monitor, organize, and verify incidents in real time.',
    subtext:
      'Project HERMES provides M/CDRRMO officers with a centralized dashboard to track incoming reports, visualize incidents geographically, and manage data with flexible and real-time tools.',
    features: [
      {
        icon: Zap,
        title: 'Real-Time Incident Feed',
        description:
          'Incoming reports displayed instantly in list and Kanban views',
      },
      {
        icon: Map,
        title: 'Map-Based Visualization',
        description:
          'Geographic display of incidents for situational awareness',
      },
      {
        icon: Filter,
        title: 'Filtering & Categorization Tools',
        description: 'Organize reports based on type, severity, or location',
      },
      {
        icon: Pencil,
        title: 'Manual Verification & Editing',
        description: 'Review and override parsed data to ensure accuracy',
      },
    ],
    image: mockLaptop,
    imageAlt: 'HERMES dashboard showing real-time incident monitoring',
    imagePosition: 'left' as const,
  },
  {
    id: 'alerts',
    headline: 'Disseminate information and manage operations securely.',
    subtext:
      'Project HERMES enables responders to broadcast advisories, deliver targeted messages, and securely manage users and access within a centralized DRRM control center.',
    features: [
      {
        icon: Bell,
        title: 'Broadcast Advisories',
        description: 'Send alerts to residents via chatbot',
      },
      {
        icon: Target,
        title: 'Targeted Messaging',
        description: 'Location-based and incident-based communication',
      },
      {
        icon: FileText,
        title: 'Predefined Templates',
        description: 'Quickly send standardized emergency advisories',
      },
      {
        icon: Shield,
        title: 'Authentication, Roles & Admin Panel',
        description:
          'Responder login, role-based access, session management, and user administration',
      },
    ],
    imagePosition: 'right' as const,
    customIllustration: true,
  },
];

export function FeatureSection() {
  return (
    <section className="-mt-20 py-24 sm:py-32 bg-muted/30 relative w-full">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <p className="text-primary text-sm font-medium tracking-wider uppercase mb-3">
            HERMES Features
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Everything you need for disaster response
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto text-pretty">
            Our platform provides comprehensive tools for incident reporting,
            real-time monitoring, and emergency communication to help
            communities respond faster and safer.
          </p>
        </div>

        {/* Feature Blocks */}
        <div className="space-y-24 md:space-y-32">
          {featureSections.map((section) => (
            <div
              key={section.id}
              className={`flex flex-col gap-12 lg:gap-16 items-center ${
                section.imagePosition === 'left'
                  ? 'lg:flex-row-reverse'
                  : 'lg:flex-row'
              }`}
            >
              {/* Image/Illustration — always first in mobile */}
              <div className="order-first lg:order-none flex-1 w-full max-w-lg lg:max-w-none flex justify-center">
                {section.customIllustration ? (
                  <div className="w-full max-w-[600px] drop-shadow-[0_0_24px_hsl(var(--primary)/0.15)]">
                    <HermesNetwork />
                  </div>
                ) : section.id === 'messaging' ? (
                  <div className="relative max-w-[280px] drop-shadow-[0_0_20px_hsl(var(--primary)/0.15)]">
                    <Image
                      src={section.image!}
                      alt={section.imageAlt!}
                      width={280}
                      height={560}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="relative drop-shadow-[0_0_24px_hsl(var(--primary)/0.15)]">
                    <Image
                      src={section.image!}
                      alt={section.imageAlt!}
                      width={600}
                      height={500}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 max-w-xl">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
                  {section.headline}
                </h3>
                <p className="text-muted-foreground text-base md:text-lg mb-8 text-pretty">
                  {section.subtext}
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {section.features.map((feature) => (
                    <div key={feature.title} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted text-muted-foreground">
                          <feature.icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
