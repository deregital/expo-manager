import * as React from 'react';
import ProfilePic from '@/components/ui/FotoModelo';
import { trpc } from '@/lib/trpc';
import Link from 'next/link';
import ModeloFillIcon from '@/components/icons/ModeloFillIcon';
import WhatsappIcon from '@/components/icons/WhatsappIcon';
import { parsePhoneNumber } from 'libphonenumber-js';

interface ChatTopbarProps {
  phoneNumber: string;
  inChat: boolean;
}

const ChatTopbar = ({ phoneNumber: phoneNumber, inChat }: ChatTopbarProps) => {
  const { data: profile } = trpc.profile.getByPhoneNumber.useQuery(
    phoneNumber,
    {
      enabled: !!phoneNumber,
    }
  );

  const formatPhoneNumber = (phone: string) => {
    try {
      const numberWithPlus = phone.startsWith('+') ? phone : `+${phone}`;
      const parsedPhoneNumber = parsePhoneNumber(numberWithPlus);

      if (parsedPhoneNumber?.isValid()) {
        return parsedPhoneNumber.formatInternational().replace('+', '');
      }

      return phone;
    } catch (error) {
      console.error('Error al formatear el número:', error);
      return phone;
    }
  };

  return (
    <div className='flex min-h-14 w-full items-center justify-between bg-white px-2'>
      {profile && (
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center gap-x-2'>
            <div className='flex items-center gap-x-2'>
              <ProfilePic
                className='my-0.5'
                alt={`Foto de ${profile.fullName}`}
                url={profile.profilePictureUrl}
              />
              <p className='font-bold'>{profile.fullName}</p>
              <p className='text-nowrap text-gray-500'>ID: {profile.shortId}</p>
            </div>
            <div className='flex flex-1 items-center gap-x-2'>
              <Link
                href={`/modelo/${profile.id}`}
                className='flex items-center justify-center rounded bg-gray-200 p-1'
                title='Ir a la vista de la modelo'
              >
                <ModeloFillIcon className='size-5' />
              </Link>
            </div>
          </div>
          <div className='flex items-center gap-x-1'>
            <Link
              title='Enviar mensaje por WhatsApp'
              href={`https://wa.me/${profile.phoneNumber}`}
              target='_blank'
              rel='noreferrer'
              className='flex items-center justify-center rounded bg-gray-200 p-1'
            >
              <WhatsappIcon className='size-5 fill-lime-600' />
            </Link>
            <p className='text-nowrap'>
              <span>{formatPhoneNumber(profile.phoneNumber)}</span>
              <span className='ml-2 hidden text-gray-400 md:inline-block'>
                {inChat ? 'Activo' : 'Inactivo'}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatTopbar;
