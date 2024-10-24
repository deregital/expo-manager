import * as React from 'react';
import FotoModelo from '@/components/ui/FotoModelo';
import { trpc } from '@/lib/trpc';
import Link from 'next/link';
import ModeloFillIcon from '@/components/icons/ModeloFillIcon';
import WhatsappIcon from '@/components/icons/WhatsappIcon';
import { parsePhoneNumber } from 'libphonenumber-js';

interface ChatTopbarProps {
  telefono: string;
  inChat: boolean;
}

const ChatTopbar = ({ telefono, inChat }: ChatTopbarProps) => {
  const { data: perfil } = trpc.modelo.getByTelefono.useQuery(telefono, {
    enabled: !!telefono,
  });

  const formatTelefono = (telefono: string) => {
    try {
      const numberWithPlus = telefono.startsWith('+')
        ? telefono
        : `+${telefono}`;
      const phoneNumber = parsePhoneNumber(numberWithPlus);

      if (phoneNumber?.isValid()) {
        return phoneNumber.formatInternational().replace('+', '');
      }

      return telefono;
    } catch (error) {
      console.error('Error al formatear el número:', error);
      return telefono;
    }
  };

  return (
    <div className='flex min-h-14 w-full items-center justify-between bg-white px-2'>
      {perfil && (
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center gap-x-2'>
            <div className='flex items-center gap-x-2'>
              <FotoModelo
                className='my-0.5'
                alt={`Foto de ${perfil.nombreCompleto}`}
                url={perfil.fotoUrl}
              />
              <p className='font-bold'>{perfil.nombreCompleto}</p>
              <p className='text-nowrap text-gray-500'>
                ID: {perfil.idLegible}
              </p>
            </div>
            <div className='flex flex-1 items-center gap-x-2'>
              <Link
                href={`/modelo/${perfil.id}`}
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
              href={`https://wa.me/${perfil.telefono}`}
              target='_blank'
              rel='noreferrer'
              className='flex items-center justify-center rounded bg-gray-200 p-1'
            >
              <WhatsappIcon className='size-5 fill-lime-600' />
            </Link>
            <p className='text-nowrap'>
              <span>{formatTelefono(perfil.telefono)}</span>
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
