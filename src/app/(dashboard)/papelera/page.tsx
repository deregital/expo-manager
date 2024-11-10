'use client';

import React from 'react';
import PapeleraList from '@/components/papelera/PapeleraList';
import { trpc } from '@/lib/trpc';

const PapeleraPage = () => {
  const { data: profiles, isLoading } =
    trpc.modelo.getProfilesInTrash.useQuery();

  return (
    <>
      <p className='p-3 text-xl font-bold md:p-5 md:text-3xl'>Papelera</p>
      <PapeleraList profiles={profiles ?? []} isLoading={isLoading} />
    </>
  );
};

export default PapeleraPage;
