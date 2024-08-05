'use client';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/lib/trpc';
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
    <div className='flex items-center justify-between px-2 py-1.5'>
      <p className='flex flex-col'>
        <span>Filtro base</span>
        {filtroBaseData?.etiquetas?.length &&
          filtroBaseData?.etiquetas?.length > 0 && (
            <span className='text-xs text-gray-400'>
              {filtroBaseData?.etiquetas?.length}{' '}
              {`etiqueta${filtroBaseData?.etiquetas?.length > 1 ? 's' : ''}`}
            </span>
          )}
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
