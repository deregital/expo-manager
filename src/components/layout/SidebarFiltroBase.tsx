'use client';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface SidebarFiltroBaseProps {}

const SidebarFiltroBase = ({}: SidebarFiltroBaseProps) => {
  const utils = trpc.useUtils();
  const { data: globalFilterData, isLoading: globalFilterLoading } =
    trpc.account.getGlobalFilter.useQuery(undefined, {
      onSuccess(data) {
        setIsChecked(data.isGlobalFilterActive);
      },
    });
  const { mutateAsync: updateGlobalFilter } =
    trpc.account.updateGlobalFilter.useMutation();

  const [isChecked, setIsChecked] = useState(
    globalFilterData?.isGlobalFilterActive ?? false
  );

  return (
    <div
      className={cn(
        'flex items-center justify-between px-2 py-1.5',
        isChecked && 'bg-yellow-300'
      )}
    >
      <div className='flex flex-col'>
        <Link href='/configuracion'>
          <span className='underline'>Filtro base</span>
        </Link>
        <p
          className={cn(
            'text-xs',
            isChecked ? 'text-black/85' : 'text-gray-400'
          )}
        >
          {globalFilterData?.globalFilter?.length ? (
            globalFilterData?.globalFilter?.length > 0 && (
              <span>
                {globalFilterData?.globalFilter?.length}{' '}
                {`etiqueta${globalFilterData?.globalFilter?.length > 1 ? 's' : ''}`}
              </span>
            )
          ) : (
            <span>Sin etiquetas</span>
          )}
        </p>
      </div>
      <Switch
        disabled={globalFilterLoading}
        checked={isChecked}
        onCheckedChange={async (active) => {
          setIsChecked(active);
          await updateGlobalFilter({
            active,
            tagsIds: globalFilterData?.globalFilter?.map((e) => e.id) ?? [],
          }).catch(() => {
            setIsChecked(!active);
          });
          utils.account.getGlobalFilter.invalidate();
          utils.profile.invalidate();
          toast.success(active ? 'Filtro activado' : 'Filtro desactivado');
        }}
      />
    </div>
  );
};

export default SidebarFiltroBase;
