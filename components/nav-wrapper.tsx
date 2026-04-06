import { Suspense } from 'react';
import { AuthButton } from './auth-button'; // This uses your server client
import { Navbar } from './landing-page/components/NavBar';

export default function NavWrapper() {
  return (
    <Navbar
      desktopAuthButton={
        <Suspense
          fallback={
            <div className="w-10 h-10 bg-muted animate-pulse rounded-full" />
          }
        >
          <AuthButton />
        </Suspense>
      }
      mobileAuthButton={
        <Suspense
          fallback={
            <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
          }
        >
          <AuthButton fullWidth size="lg" />
        </Suspense>
      }
    />
  );
}
