'use client';

import React, { Suspense } from 'react';
import FiltroTabla from '@/components/modelos/FiltroTabla';
import ModelosTable from '@/components/modelos/table/ModelosTable';

const ModelosPage = () => {
  return (
    <Suspense>
      <p className='px-3 pt-3 text-xl font-bold md:px-5 md:pt-5 md:text-3xl'>
        Gestor de Modelos
      </p>
      <FiltroTabla />
      <ModelosTable />
    </Suspense>
  );
};

export default ModelosPage;
