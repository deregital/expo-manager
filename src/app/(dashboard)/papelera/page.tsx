'use client';

import React from 'react';
import PapeleraList from '@/components/papelera/PapeleraList';
import { trpc } from '@/lib/trpc';

const PapeleraPage = () => {
  const { data: modelos } = trpc.modelo.getModelosPapelera.useQuery();

  return (
    <div className='flex flex-col gap-y-5 p-3 md:p-5 '>
      <p className='text-xl font-bold md:text-3xl'>Papelera</p>
      <PapeleraList modelos={modelos ?? []} isLoading={false} />
    </div>
  );
};

export default PapeleraPage;
