import React from 'react';

interface NoSelectedChatPageProps {}

const NoSelectedChatPage = ({}: NoSelectedChatPageProps) => {
  return (
    <div className='flex w-full flex-col items-center justify-center'>
      <h3 className='text-center text-xl text-slate-500'>
        No hay ningún chat seleccionado
      </h3>
      <p className='text-balance text-center text-sm text-slate-400'>
        Seleccioná un perfil{' '}
        <span className='inline sm:hidden'>
          en el menú de arriba a la izquierda
        </span>{' '}
        para ver el chat
      </p>
    </div>
  );
};

export default NoSelectedChatPage;
