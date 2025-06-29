'use client';

import { trpc } from '@/lib/trpc';
import RoleModal from './RoleModal';
import Loader from '@/components/ui/loader';

const RoleList = () => {
  const { data, isLoading, refetch } = trpc.role.getAll.useQuery();

  return isLoading ? (
    <Loader />
  ) : (
    <div>
      <RoleModal action='CREATE' refetchRoles={refetch} />
      <div className='mt-4 flex w-full flex-wrap gap-4'>
        {data && data.length > 0 ? (
          data.map((role, index) => (
            <div
              key={index}
              className='flex flex-wrap items-center justify-center gap-4 rounded-lg border-2 bg-white px-4 py-2'
            >
              <p>{role.name}</p>
              <RoleModal action='EDIT' role={role} refetchRoles={refetch} />
            </div>
          ))
        ) : (
          <p className='py-4 font-semibold'>
            No hay roles, crea el primer rol.
          </p>
        )}
      </div>
    </div>
  );
};

export default RoleList;
