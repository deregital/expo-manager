import ChatFillIcon from '@/components/icons/ChatFillIcon';
import ProfilePic from '@/components/ui/ProfilePic';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type RouterOutputs } from '@/server';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale/es';
import React from 'react';

interface ContactoCardProps {
  profile: RouterOutputs['profile']['getAllWithActiveChat'][number];
  inPage: boolean;
  nonRead: number;
}

const ContactoCard = ({ profile, inPage, nonRead }: ContactoCardProps) => {
  const mostRecentMessage = profile.messages.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )[profile.messages.length - 1];

  return (
    <div
      className={cn('flex items-center justify-between gap-2 p-2', {
        'hover:bg-gray-200': !inPage,
        'bg-green-200 hover:bg-green-300': inPage,
      })}
    >
      <div className='relative'>
        <ProfilePic url={profile.profilePictureUrl} />
        <Badge className='absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center bg-red-500 hover:bg-red-500'>
          {nonRead}
        </Badge>
      </div>
      <div className='flex w-full items-center justify-between gap-x-2 overflow-x-hidden'>
        <div className='flex w-full flex-col gap-y-0'>
          <p className='truncate'>{profile.fullName}</p>
          <span className='truncate whitespace-nowrap align-baseline text-xs text-gray-500'>
            {formatDistance(
              new Date(mostRecentMessage.created_at),
              new Date(),
              {
                locale: es,
                addSuffix: true,
              }
            )}
          </span>
        </div>
        {profile.inChat && <ChatFillIcon />}
      </div>
    </div>
  );
};

export default ContactoCard;
