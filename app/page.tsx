import { AuthButton } from '@/components/auth-button';
import Logo from '@/components/brand/logo';
import Wordmark from '@/components/brand/wordmark';
import WordmarkLogo from '@/components/brand/wordmark-logo';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Link from 'next/link';
import { Suspense } from 'react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <Link href="/" className="font-semibold flex items-center">
              <Logo className="block sm:hidden" />
              <Wordmark className="hidden sm:block md:hidden" />
              <WordmarkLogo className="hidden md:block" />
            </Link>
            <div className="flex gap-4 items-center">
              <Suspense>
                <AuthButton />
              </Suspense>
              <ThemeSwitcher />
            </div>
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-12 max-w-2xl p-5 items-center text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Welcome</h1>
          </div>
        </div>
      </div>
    </main>
  );
}
