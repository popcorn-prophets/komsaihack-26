'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { ComponentProps } from 'react';

type LogoutButtonProps = Omit<
  ComponentProps<typeof Button>,
  'children' | 'onClick'
>;

export function LogoutButton(props: LogoutButtonProps) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <Button onClick={logout} {...props}>
      Logout
    </Button>
  );
}
