'use client';

import { AvatarStack } from '@/components/avatar/avatar-stack';
import { useRealtimePresenceRoom } from '@/hooks/avatar/use-realtime-presence-room';

export const RealtimeAvatarStack = ({ roomName }: { roomName: string }) => {
  const { users: usersMap } = useRealtimePresenceRoom(roomName);
  const avatars = Object.values(usersMap)
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((user) => ({
      id: user.id,
      name: user.name,
      image: user.image,
    }));

  return <AvatarStack avatars={avatars} />;
};
