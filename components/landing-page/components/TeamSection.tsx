'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CardDecorator } from '@/components/ui/card-decorator';
import { Github } from 'lucide-react';

const team = [
  {
    id: 1,
    name: 'Andrian Lloyd Maagma',
    role: 'Lead Developer',
    description:
      '2nd year Computer Science student at the University of the Philippines Visayas',
    fallback: 'AM',
    social: { github: 'https://github.com/andrianllmm' },
  },
  {
    id: 2,
    name: 'Dejel Cyrus De Asis',
    role: 'Developer',
    description:
      '2nd year Computer Science student at the University of the Philippines Visayas',
    fallback: 'DC',
    social: { github: 'https://github.com/dejely' },
  },
  {
    id: 3,
    name: 'Justin Lauricio',
    role: 'Developer',
    description:
      '2nd year Computer Science student at the University of the Philippines Visayas',
    fallback: 'JL',
    social: { github: 'https://github.com/llaollao902' },
  },
  {
    id: 4,
    name: 'John Romyr Lopez',
    role: 'Developer',
    description:
      '2nd year Computer Science student at the University of the Philippines Visayas',
    fallback: 'JR',
    social: { github: 'https://github.com/Romyr05' },
  },
  {
    id: 5,
    name: 'Julian Medalla',
    role: 'Developer',
    description:
      '2nd year Computer Science student at the University of the Philippines Visayas',
    fallback: 'JM',
    social: { github: 'https://github.com/TheAbyssStaresBack' },
  },
];

export function TeamSection() {
  return (
    <section
      id="team"
      className="-mt-30 py-24 bg-muted/30 sm:py-32 flex justify-center relative w-full"
    >
      <style>{`
        .team-card {
          transition:
            transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.3s ease,
            border-color 0.3s ease;
          box-shadow:
            0 0 0 1px hsl(var(--border)),
            0 0 12px -2px hsl(var(--primary) / 0.08),
            0 0 28px -4px hsl(var(--primary) / 0.05);
        }

        .team-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow:
            0 0 0 1px hsl(var(--primary) / 0.3),
            0 0 20px -2px hsl(var(--primary) / 0.2),
            0 0 50px -6px hsl(var(--primary) / 0.15),
            0 8px 30px -8px hsl(var(--primary) / 0.2);
          border-color: hsl(var(--primary) / 0.3) !important;
        }

        .team-card .avatar-wrapper {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .team-card:hover .avatar-wrapper {
          transform: scale(1.08);
        }

        .team-card .member-name {
          transition: color 0.2s ease;
        }

        .team-card:hover .member-name {
          color: hsl(var(--primary));
        }

        .team-card .github-btn {
          transition:
            background-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .team-card:hover .github-btn {
          background-color: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
          transform: scale(1.15);
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Our Team
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Meet Popcorn Prophets
          </h2>
          <p className="text-lg text-muted-foreground">
            We&apos;ve been taught that innovation is most meaningful when it
            serves the people. We are dedicated to using our technical skills to
            bridge the gap between technology and the community, creating
            solutions that empower and uplift those around us.
          </p>
        </div>

        {/* Centered Team Container */}
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-8">
            {team.map((member) => (
              <Card
                key={member.id}
                className="team-card shadow-sm py-2 w-full max-w-[280px] shrink-0 border-muted/50"
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    {/* Avatar */}
                    <div className="avatar-wrapper flex justify-center mb-4">
                      <CardDecorator>
                        <Avatar className="h-24 w-24 border-2 border-background shadow-md">
                          <AvatarImage
                            alt={member.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-lg font-semibold">
                            {member.fallback}
                          </AvatarFallback>
                        </Avatar>
                      </CardDecorator>
                    </div>

                    {/* Name and Role */}
                    <h3 className="member-name text-lg font-semibold text-foreground mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm font-medium text-primary mb-3">
                      {member.role}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed line-clamp-3">
                      {member.description}
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="github-btn h-8 w-8 rounded-full"
                        asChild
                      >
                        <a
                          href={member.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
