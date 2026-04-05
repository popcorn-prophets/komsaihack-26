'use client';

import { useEffect, useState } from 'react';
import { Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type ThemeOption = 'system' | 'light' | 'dark';

const THEME_OPTIONS: Array<{
  icon: typeof Laptop;
  label: string;
  value: ThemeOption;
}> = [
  {
    icon: Laptop,
    label: 'System',
    value: 'system',
  },
  {
    icon: Sun,
    label: 'Light',
    value: 'light',
  },
  {
    icon: Moon,
    label: 'Dark',
    value: 'dark',
  },
];

function isThemeOption(value: string | undefined): value is ThemeOption {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function AppearanceSettingsCard() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme = isThemeOption(theme) ? theme : 'system';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Choose how Project HERMES looks on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Field>
          <FieldLabel>Theme</FieldLabel>
          <FieldDescription>
            Switch between light, dark, or your system preference.
          </FieldDescription>
          {mounted ? (
            <ToggleGroup
              type="single"
              variant="outline"
              value={selectedTheme}
              onValueChange={(value) => {
                if (isThemeOption(value)) {
                  setTheme(value);
                }
              }}
              className="flex-wrap"
            >
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;

                return (
                  <ToggleGroupItem key={option.value} value={option.value}>
                    <Icon />
                    {option.label}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-16 rounded-md" />
            </div>
          )}
        </Field>
      </CardContent>
    </Card>
  );
}
