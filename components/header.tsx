import Link from 'next/link';
import { Suspense } from 'react';
import { AuthButton } from './auth-button';
import Logo from './brand/logo';
import Wordmark from './brand/wordmark';
import WordmarkLogo from './brand/wordmark-logo';
import { ThemeSwitcher } from './theme-switcher';

export default function Header() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <Link href="/" className="font-semibold flex items-center">
          <Logo className="block sm:hidden" />
          <Wordmark className="hidden sm:block md:hidden" />
          <WordmarkLogo className="hidden md:block" />
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/chat">Chat</Link>
          <Link href="/control-center">Control Center</Link>
          <Suspense>
            <AuthButton />
          </Suspense>
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}
