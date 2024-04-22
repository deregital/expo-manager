import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';
import Image from 'next/image';

interface FotoModeloProps {
  url: string | null;
}

const FotoModelo = ({ url }: FotoModeloProps) => {
  return (
    <Avatar>
      <AvatarImage
        width={50}
        height={50}
        src={url ?? '/img/profilePlaceholder.jpg'}
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

export default FotoModelo;
