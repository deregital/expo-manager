'use client';

import React, { Suspense } from 'react';
import FiltroTabla from '@/components/modelos/FiltroTabla';
import ModelosTable from '@/components/modelos/table/ModelosTable';
import CrearModelo from '@/components/modelos/CrearModelo';

const ModelosPage = () => {
  return (
    <Suspense>
      <div className='flex items-end justify-between'>
        <p className='px-3 pt-3 text-xl font-bold md:px-5 md:pt-5 md:text-3xl'>
          Base de Datos
        </p>
        <CrearModelo />
      </div>
      <FiltroTabla />
      <ModelosTable />
    </Suspense>
  );
};

export default ModelosPage;
