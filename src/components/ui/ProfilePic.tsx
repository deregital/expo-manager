import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProfilePicProps extends React.ComponentPropsWithoutRef<'img'> {
  url: string | null;
}

const ProfilePic = ({ url, className, ...props }: ProfilePicProps) => {
  return (
    <Avatar className={cn(className)}>
      <AvatarImage
        width={50}
        height={50}
        src={url ?? '/img/profilePlaceholder.jpg'}
        {...props}
      />
      <AvatarFallback>
        <Image
          src={'/img/profilePlaceholder.jpg'}
          width={50}
          height={50}
          alt='Placeholder'
        />
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfilePic;
