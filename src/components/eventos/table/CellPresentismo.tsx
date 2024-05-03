'use client';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import { Row } from '@tanstack/react-table';
import { toast } from 'sonner';

export const CellPresentismo = ({
  row,
  AsistenciaId,
}: {
  row: Row<RouterOutputs['modelo']['getByEtiqueta'][number]>;
  AsistenciaId: string;
}) => {
  const etiquetasId = row.original.etiquetas.map(
    (etiqueta: any) => etiqueta.id
  );
  const { data: etiqueta } = trpc.etiqueta.getById.useQuery(
    AsistenciaId,
    {
      enabled: !!row.original,
    }
  );
  const editModelo = trpc.modelo.edit.useMutation();
  const useUtils = trpc.useUtils();

  async function addAsistencia(
    modelo: RouterOutputs['modelo']['getByEtiqueta'][number]
  ) {
    toast.loading('Confirmando asistencia');
    const etiquetasId = modelo.etiquetas.map((etiqueta) => {
      return {
        id: etiqueta.id,
        grupo: {
          id: etiqueta.grupoId,
          esExclusivo: etiqueta.grupo.esExclusivo,
        },
        nombre: etiqueta.nombre,
      };
    });
    await editModelo.mutateAsync({
      id: modelo.id,
      etiquetas: [
        ...etiquetasId,
        {
          id: etiqueta!.id,
          grupo: {
            id: etiqueta!.grupo.id,
            esExclusivo: etiqueta!.grupo.esExclusivo,
          },
          nombre: etiqueta!.nombre,
        },
      ],
    });
    toast.dismiss();
    toast.success('Se confirmó su asistencia');
    useUtils.modelo.getAll.invalidate();
  }

  async function deleteAsistencia(
    modelo: RouterOutputs['modelo']['getByEtiqueta'][number]
  ) {
    toast.loading('Eliminando presentismo');
    const etiquetasId = modelo.etiquetas.map((etiqueta) => {
      return {
        id: etiqueta.id,
        grupo: {
          id: etiqueta.grupoId,
          esExclusivo: etiqueta.grupo.esExclusivo,
        },
        nombre: etiqueta.nombre,
      };
    });
    await editModelo.mutateAsync({
      id: modelo.id,
      etiquetas: etiquetasId.filter((et) => et.id !== etiqueta!.id),
    });
    toast.dismiss();
    toast.success('Se eliminó del presentismo');
    useUtils.modelo.getAll.invalidate();
  }

  return (
    <div className='flex flex-wrap items-center justify-center gap-1'>
      {etiquetasId.includes(AsistenciaId) ? (
        <div className='flex items-center justify-center gap-x-2'>
          <input type='checkbox' className='w-6 h-6' checked onClick={() => deleteAsistencia(row.original)} />
        </div>
      ) : (
        <>
            <input type='checkbox' className='w-6 h-6' onClick={() => addAsistencia(row.original)} />
        </>
      )}
    </div>
  );
};

export default CellPresentismo;
