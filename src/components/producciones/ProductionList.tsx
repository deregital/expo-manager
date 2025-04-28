'use client';

import Loader from '@/components/ui/loader';
import { trpc } from '@/lib/trpc';

export const ProductionList = () => {
  const { data, isLoading } = trpc.production.getAll.useQuery();

  return !isLoading ? (
    <div className='flex flex-col gap-2'>
      {data!.productions.map((production) => (
        <p
          key={production.id}
          className='text-sm text-gray-700 dark:text-gray-200 md:text-base'
        >
          {production.name}
        </p>
      ))}
    </div>
  ) : (
    <Loader />
  );
};
