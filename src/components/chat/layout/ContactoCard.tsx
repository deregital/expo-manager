import ChatFillIcon from '@/components/icons/ChatFillIcon';
import ProfilePic from '@/components/ui/ProfilePic';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import React from 'react';

interface ContactoCardProps {
  profile: RouterOutputs['profile']['getAllWithActiveChat'][number];
  inPage: boolean;
  nonRead: number;
}

const ContactoCard = ({ profile, inPage, nonRead }: ContactoCardProps) => {
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
        <p className='truncate'>{profile.fullName}</p>
        {profile.inChat && <ChatFillIcon />}
      </div>
    </div>
  );
};

export default ContactoCard;
