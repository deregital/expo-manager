'use client';
import PapeleraList from '@/components/papelera/PapeleraList';
import React from 'react';
const PapeleraPage = () => {
  return (
    <div className='flex flex-col gap-y-5 p-3 md:p-5 '>
      <p className='text-xl font-bold md:text-3xl'>Papelera</p>
      <PapeleraList modelos={[]} isLoading={false} />
    </div>
  );
};

export default PapeleraPage;
