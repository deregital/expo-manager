import ModeloFillIcon from '@/components/icons/ModeloFillIcon';
import FotoModelo from '@/components/ui/FotoModelo';
import { trpc } from '@/lib/trpc';
import Link from 'next/link';
import React from 'react';

interface ChatTopbarProps {
  telefono: string;
  inChat: boolean;
}

const ChatTopbar = ({ telefono, inChat }: ChatTopbarProps) => {
  const { data: perfil } = trpc.modelo.getByTelefono.useQuery(telefono, {
    enabled: !!telefono,
  });

  return (
    <div className='flex h-14 w-full items-center justify-between bg-white px-2'>
      {perfil && (
        <>
          <FotoModelo
            alt={`Foto de ${perfil.nombreCompleto}`}
            url={perfil.fotoUrl}
          />
          <div>
            <p>
              <span className='font-bold'>{`${perfil.nombreCompleto} - ${perfil.telefono}`}</span>
              {inChat && <span className='text-gray-400'> en línea</span>}
              <span className='align-text-top'>
                <Link
                  className='ml-2 inline-block'
                  href={`/modelo/${perfil.id}`}
                >
                  <ModeloFillIcon />
                </Link>
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatTopbar;
