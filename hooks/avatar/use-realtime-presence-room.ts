'use client';

import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type RealtimeUser = {
  id: string;
  name: string;
  image: string | null;
};

type PresenceUser = RealtimeUser;

export const useRealtimePresenceRoom = (roomName: string) => {
  const [users, setUsers] = useState<Record<string, RealtimeUser>>({});

  useEffect(() => {
    const room = supabase.channel(roomName);
    let isActive = true;

    const syncUsers = () => {
      const presenceState = room.presenceState<PresenceUser>();
      const nextUsers: Record<string, RealtimeUser> = {};

      for (const presences of Object.values(presenceState)) {
        for (const presence of presences) {
          if (!presence.id) {
            continue;
          }

          nextUsers[presence.id] = {
            id: presence.id,
            name: presence.name || 'Unknown user',
            image: presence.image ?? null,
          };
        }
      }

      if (isActive) {
        setUsers(nextUsers);
      }
    };

    const subscribeToRoom = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
      }

      if (!isActive) {
        void room.unsubscribe();
        return;
      }

      const sessionUser = data.session?.user;

      if (!sessionUser) {
        setUsers({});
        void room.unsubscribe();
        return;
      }

      const name =
        typeof sessionUser.user_metadata.full_name === 'string' &&
        sessionUser.user_metadata.full_name.trim()
          ? sessionUser.user_metadata.full_name.trim()
          : 'Unknown user';
      const image =
        typeof sessionUser.user_metadata.avatar_url === 'string' &&
        sessionUser.user_metadata.avatar_url.trim()
          ? sessionUser.user_metadata.avatar_url
          : null;

      room
        .on('presence', { event: 'sync' }, syncUsers)
        .subscribe(async (status) => {
          if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
            await room.track({
              id: sessionUser.id,
              name,
              image,
            });
          } else if (isActive) {
            setUsers({});
          }
        });
    };

    void subscribeToRoom();

    return () => {
      isActive = false;
      void room.unsubscribe();
    };
  }, [roomName]);

  return { users };
};
