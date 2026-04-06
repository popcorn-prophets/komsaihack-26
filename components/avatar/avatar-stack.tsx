import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const avatarStackVariants = cva('flex -space-x-4 -space-y-4', {
  variants: {
    orientation: {
      vertical: 'flex-col',
      horizontal: 'flex-row',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export interface AvatarStackProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarStackVariants> {
  avatars: { id: string; name: string; image: string | null }[];
  maxAvatarsAmount?: number;
}

const AvatarStack = ({
  className,
  orientation,
  avatars,
  maxAvatarsAmount = 3,
  ...props
}: AvatarStackProps) => {
  const shownAvatars = avatars.slice(0, maxAvatarsAmount);
  const hiddenAvatars = avatars.slice(maxAvatarsAmount);

  return (
    <div
      className={cn(
        avatarStackVariants({ orientation }),
        className,
        orientation === 'horizontal' ? '-space-y-0' : '-space-x-0'
      )}
      {...props}
    >
      {shownAvatars.map(({ id, name, image }) => (
        <Tooltip key={id}>
          <TooltipTrigger asChild>
            <Avatar className="hover:z-10">
              <AvatarImage src={image ?? undefined} />
              <AvatarFallback>
                {name
                  ?.split(' ')
                  ?.map((word) => word[0])
                  ?.join('')
                  ?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>{name}</p>
          </TooltipContent>
        </Tooltip>
      ))}

      {hiddenAvatars.length ? (
        <Tooltip key="hidden-avatars">
          <TooltipTrigger asChild>
            <Avatar>
              <AvatarFallback>
                +{avatars.length - shownAvatars.length}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            {hiddenAvatars.map(({ id, name }) => (
              <p key={id}>{name}</p>
            ))}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
};

export { AvatarStack, avatarStackVariants };
