'use client';
import { Card, CardContent } from '@/components/ui/card';
import { BookX, Clock, EyeOff, GitFork } from 'lucide-react';

const challenges = [
  {
    icon: BookX,
    title: 'Unstructured Reports',
    description:
      'Residents report incidents via inconsistent, free-form formats that are difficult to process.',
  },
  {
    icon: Clock,
    title: 'Slow Response Time',
    description:
      'Manual parsing of reports creates bottlenecks that delay critical emergency response.',
  },
  {
    icon: GitFork,
    title: 'Fragmented Channels',
    description:
      'Communication is scattered across multiple platforms with no central coordination point.',
  },
  {
    icon: EyeOff,
    title: 'Limited Awareness',
    description:
      'Responders lack real-time situational awareness, hindering effective resource allocation.',
  },
];

export function ChallengesSection() {
  return (
    <section className="-mt-40 py-12 sm:py-16 relative w-full">
      {/* Seamless top fade */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-background via-background/60 to-transparent z-10 pointer-events-none" />
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-secondary/20 [mask-image:linear-gradient(to_bottom,transparent,black_150px)]" />
      <div className="w-full pt-20 px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            <span className="text-foreground">The</span>{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Challenges
            </span>
          </h2>
        </div>
        {/* Challenges Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {challenges.map((challenge, index) => (
            <Card
              key={index}
              className="
                bg-background/60 backdrop-blur-sm border-border/50 py-0
                transition-all duration-300 hover:border-foreground/20 hover:shadow-lg hover:shadow-foreground/5
                hover:-translate-y-1
              "
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <challenge.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-foreground">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {challenge.description}
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
