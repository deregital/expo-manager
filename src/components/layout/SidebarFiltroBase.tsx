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
  const { data: filtroBaseData, isLoading: filtroBaseLoading } =
    trpc.cuenta.getFiltroBase.useQuery(undefined, {
      onSuccess(data) {
        setIsChecked(data.activo);
      },
    });
  const { mutateAsync: updateFiltroBase } =
    trpc.cuenta.updateFiltroBase.useMutation();

  const [isChecked, setIsChecked] = useState(filtroBaseData?.activo ?? false);

  return (
    <div
      className={cn(
        'flex items-center justify-between px-2 py-1.5',
        isChecked && 'bg-yellow-300'
      )}
    >
      <p className='flex flex-col'>
        <Link href='/configuracion'>
          <span className='underline'>Filtro base</span>
        </Link>
        <p
          className={cn(
            'text-xs',
            isChecked ? 'text-black/85' : 'text-gray-400'
          )}
        >
          {filtroBaseData?.etiquetas?.length ? (
            filtroBaseData?.etiquetas?.length > 0 && (
              <span>
                {filtroBaseData?.etiquetas?.length}{' '}
                {`etiqueta${filtroBaseData?.etiquetas?.length > 1 ? 's' : ''}`}
              </span>
            )
          ) : (
            <span>Sin etiquetas</span>
          )}
        </p>
      </p>
      <Switch
        disabled={filtroBaseLoading}
        checked={isChecked}
        onCheckedChange={async (activo) => {
          setIsChecked(activo);
          await updateFiltroBase({
            activo,
            etiquetas: filtroBaseData?.etiquetas?.map((e) => e.id),
          }).catch(() => {
            setIsChecked(!activo);
          });
          utils.cuenta.getFiltroBase.invalidate();
          utils.modelo.invalidate();
          toast.success(activo ? 'Filtro activado' : 'Filtro desactivado');
        }}
      />
    </div>
  );
};

export default SidebarFiltroBase;
