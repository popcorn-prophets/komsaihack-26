'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

const ICON_SIZE = 16;

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const applyThemeWithTransition = (newTheme: string) => {
    const rect = triggerRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    document.documentElement.style.setProperty('--click-x', `${x}px`);
    document.documentElement.style.setProperty('--click-y', `${y}px`);

    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    document.startViewTransition(() => {
      setTheme(newTheme);
    });
  };

  const cycleTheme = () => {
    if (resolvedTheme === 'light') {
      applyThemeWithTransition('dark');
    } else {
      applyThemeWithTransition('light');
    }
  };

  return (
    <Button ref={triggerRef} variant="ghost" size="sm" onClick={cycleTheme}>
      {resolvedTheme === 'light' ? (
        <Sun size={ICON_SIZE} className="text-muted-foreground" />
      ) : (
        <Moon size={ICON_SIZE} className="text-muted-foreground" />
      )}
    </Button>
  );
};

export { ThemeSwitcher };
