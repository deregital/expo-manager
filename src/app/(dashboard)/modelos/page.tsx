'use client';

import React, { Suspense } from 'react';
import FiltroTabla from '@/components/modelos/FiltroTabla';
import ProfilesTable from '@/components/modelos/table/ModelosTable';
import CreateProfile from '@/components/modelos/CrearModelo';

const ProfilesPage = () => {
  return (
    <Suspense>
      <div className='flex items-end justify-between'>
        <p className='px-3 pt-3 text-xl font-bold md:px-5 md:pt-5 md:text-3xl'>
          Base de Datos
        </p>
        <CreateProfile />
      </div>
      <FiltroTabla />
      <ProfilesTable />
    </Suspense>
  );
};

export default ProfilesPage;
