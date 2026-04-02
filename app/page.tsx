'use client';

import ControlCenter from '@/components/control-center';
import LandingPage from '@/components/landing-page';
import { useUser } from '@/hooks/useUser';

export default function Home() {
  const user = useUser();
  // Loading user session...
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-foreground/70">Loading...</p>
      </div>
    );
  }
  // If user exists, show control center
  if (user) {
    return <ControlCenter />;
  }
  // If no user, show landing page
  return <LandingPage />;
}
