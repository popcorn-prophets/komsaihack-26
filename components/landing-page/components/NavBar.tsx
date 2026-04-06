'use client';

import Logo from '@/components/brand/logo';
import Wordmark from '@/components/brand/wordmark';
import WordmarkLogo from '@/components/brand/wordmark-logo';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Github, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { ReactNode, useState } from 'react';

const navigationItems = [
  { name: 'Home', href: '#hero' },
  { name: 'Features', href: '#features' },
  { name: 'Team', href: '#team' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'FAQ', href: '#faq' },
  { name: 'Contact', href: '#contact' },
];

// Smooth scroll function
const smoothScrollTo = (targetId: string) => {
  if (targetId.startsWith('#')) {
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
};

export function Navbar({
  desktopAuthButton,
  mobileAuthButton,
}: {
  desktopAuthButton?: ReactNode;
  mobileAuthButton?: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { setTheme, theme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="font-semibold flex items-center">
            <Logo className="block sm:hidden" />
            <Wordmark className="hidden sm:block md:hidden" />
            <WordmarkLogo className="hidden md:block" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden xl:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.name}>
                <NavigationMenuLink
                  className="group inline-flex h-10 w-max items-center justify-center px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:text-primary focus:outline-none cursor-pointer"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    if (item.href.startsWith('#')) {
                      smoothScrollTo(item.href);
                    } else {
                      window.location.href = item.href;
                    }
                  }}
                >
                  {item.name}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop CTA */}
        <div className="hidden xl:flex items-center gap-4 text-sm">
          {/* Control Center */}
          <Link href="/control-center">Control Center</Link>

          {desktopAuthButton}

          {/* GitHub */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="cursor-pointer mr-[-15px] ml-[-12px]"
          >
            <a
              href="https://github.com/popcorn-prophets/project-hermes"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>

          {/* Theme Switcher */}
          <ThemeSwitcher />
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="xl:hidden">
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full sm:w-[400px] p-0 gap-0 [&>button]:hidden overflow-hidden flex flex-col"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <SheetHeader className="space-y-0 p-4 pb-2 border-b">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Logo size={16} />
                  </div>
                  <SheetTitle className="text-lg font-semibold">
                    ShadcnStore
                  </SheetTitle>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setTheme(theme === 'light' ? 'dark' : 'light')
                      }
                      className="cursor-pointer h-8 w-8"
                    >
                      <Moon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Sun className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="cursor-pointer h-8 w-8"
                    >
                      <a
                        href="https://github.com/popcorn-prophets/project-hermes"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub Repository"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="cursor-pointer h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </SheetHeader>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto">
                <nav className="p-6 space-y-1">
                  {navigationItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      onClick={(e) => {
                        setIsOpen(false);
                        if (item.href.startsWith('#')) {
                          e.preventDefault();
                          setTimeout(() => smoothScrollTo(item.href), 100);
                        }
                      }}
                    >
                      {item.name}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Footer Actions */}
              <div className="border-t p-6 space-y-4">
                <div className="flex flex-col gap-3">
                  {' '}
                  {/* Changed to flex-col for better control */}
                  {/* Control Center - Now full width to match the grid below */}
                  <Button
                    variant="ghost"
                    size="lg"
                    asChild
                    className="w-full justify-center text-base font-medium cursor-pointer"
                  >
                    <Link href="/control-center">Control Center</Link>
                  </Button>
                  {mobileAuthButton}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
