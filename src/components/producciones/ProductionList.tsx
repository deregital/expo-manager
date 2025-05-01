'use client';

import AdminIcon from '@/components/icons/AdminIcon';
import { ProductionModal } from '@/components/producciones/ProductionModal';
import { Card, CardTitle } from '@/components/ui/card';
import Loader from '@/components/ui/loader';
import { trpc } from '@/lib/trpc';

export const ProductionList = () => {
  const { data, isLoading } = trpc.production.getAll.useQuery();

  return !isLoading ? (
    <div className='flex flex-wrap gap-2'>
      {data!.productions.map((production) => (
        <Card className='relative p-2' key={production.id}>
          <div className='flex items-center justify-between gap-x-4'>
            <CardTitle className='max-w-[33dvw] text-lg font-bold'>
              {production.name}
            </CardTitle>
            <ProductionModal
              mode='edit'
              productionId={production.id}
              productionName={production.name}
              producerId={production.administrator!.id}
            />
          </div>
          {production.administrator && (
            <div className='flex items-center gap-2'>
              <AdminIcon />
              <span className='text-sm text-gray-500'>
                Administrador: {production.administrator.fullName}
              </span>
            </div>
          )}
        </Card>
      ))}
    </div>
  ) : (
    <Loader />
  );
};
