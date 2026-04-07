'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view');
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .cta-item {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .in-view .cta-item-1 { opacity: 1; transform: none; transition-delay: 0ms; }
        .in-view .cta-item-2 { opacity: 1; transform: none; transition-delay: 150ms; }
        .in-view .cta-item-3 { opacity: 1; transform: none; transition-delay: 280ms; }

        .cta-gradient-text {
          background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cta-btn { transition: opacity 0.2s ease, transform 0.2s ease !important; }
        .cta-btn:hover { opacity: 0.85; transform: translateY(-2px); }
        .cta-btn:active { transform: translateY(0); }
      `}</style>

      <section
        ref={sectionRef}
        className="-mt-20 py-16 lg:py-24 bg-muted/80 relative w-full"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="cta-item cta-item-1 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Faster response starts with
                  <span className="flex sm:inline-flex justify-center">
                    <span className="relative mx-2">
                      <span className="cta-gradient-text">
                        better communication
                      </span>
                      <div className="absolute start-0 -bottom-2 h-1 w-full bg-gradient-to-r from-primary/30 to-secondary/30" />
                    </span>
                  </span>
                </h1>

                <p className="cta-item cta-item-2 text-muted-foreground mx-auto max-w-2xl text-balance lg:text-xl">
                  HERMES connects your community and your DRRMO office in real
                  time — turning unstructured citizen reports into actionable
                  incident data, instantly.
                </p>
              </div>

              <div className="cta-item cta-item-3 flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
                <Button
                  size="lg"
                  className="cta-btn cursor-pointer px-8 py-4 text-lg font-medium"
                  asChild
                >
                  <a href="/auth/login">Get Started</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
