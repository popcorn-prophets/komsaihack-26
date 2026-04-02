'use client';

import { useUser } from '@/hooks/useUser';
import Header from '../header';
import { LogoutButton } from '../logout-button';

export default function ControlCenter() {
  const user = useUser();

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Header />
        <div className="items-center text-center flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Control Center</h1>
          {user ? (
            <>
              <p>
                Welcome, <span className="font-medium">{user.email}</span>!
              </p>
              <LogoutButton />
            </>
          ) : (
            <p>Loading user information...</p>
          )}
        </div>
      </div>
    </main>
  );
}
