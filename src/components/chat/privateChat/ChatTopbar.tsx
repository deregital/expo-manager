import * as React from 'react';
import ModeloFillIcon from '@/components/icons/ModeloFillIcon';
import FotoModelo from '@/components/ui/FotoModelo';
import WhatsappIcon from '@/components/icons/WhatsappIcon';
import { trpc } from '@/lib/trpc';
import Link from 'next/link';

interface ChatTopbarProps {
  telefono: string;
  inChat: boolean;
}

const ChatTopbar = ({ telefono, inChat }: ChatTopbarProps) => {
  const { data: perfil } = trpc.modelo.getByTelefono.useQuery(telefono, {
    enabled: !!telefono,
  });

  const formatTelefono = (telefono: string) => {
    const codigoPais = telefono.slice(0, 2);
    const codigoArea = telefono.slice(2, 3);
    const numeroPrincipal = telefono.slice(3);

    return `${codigoPais} ${codigoArea} ${numeroPrincipal}`;
  };

  return (
    <div className='flex h-14 w-full items-center justify-between bg-white px-2'>
      {perfil && (
        <>
          <div className='flex items-center'>
            <FotoModelo
              alt={`Foto de ${perfil.nombreCompleto}`}
              url={perfil.fotoUrl}
            />
            <div className='ml-2 flex items-center'>
              <p className='font-bold'>{perfil.nombreCompleto}</p>

              <p className='ml-2 text-gray-500'>{`ID: ${perfil.idLegible}`}</p>

              <span className='ml-2 flex items-center justify-center rounded bg-gray-200 p-1'>
                <Link
                  href={`/modelo/${perfil.id}`}
                  title='Ir a la vista de la modelo'
                >
                  <ModeloFillIcon />
                </Link>
              </span>
            </div>
          </div>
          <div className='flex items-center'>
            {/* Ícono de WhatsApp */}
            <a
              title='Enviar mensaje por WhatsApp'
              href={`https://wa.me/${perfil.telefono}`}
              target='_blank'
              rel='noreferrer'
              className='flex items-center justify-center rounded bg-gray-200 p-1'
            >
              <WhatsappIcon className='h-5 w-5 fill-lime-600' />
            </a>
            <p className='ml-2'>
              <span>{formatTelefono(perfil.telefono)}</span>
              <span className='ml-4 text-gray-400'>
                {inChat ? 'Activo' : 'Inactivo'}
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatTopbar;
