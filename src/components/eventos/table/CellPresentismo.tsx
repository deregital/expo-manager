'use client';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import { Row } from '@tanstack/react-table';
import { toast } from 'sonner';

export const CellPresentismo = ({
  row,
  confirmoId,
  asistioId,
}: {
  row: Row<RouterOutputs['modelo']['getByEtiqueta'][number]>;
  confirmoId: string;
  asistioId: string;
}) => {
  const etiquetasId = row.original.etiquetas.map(
    (etiqueta: any) => etiqueta.id
  );
  const { data: etiquetaAsistio } = trpc.etiqueta.getById.useQuery(asistioId, {
    enabled: !!row.original,
  });
  const { data: etiquetaConfirmo } = trpc.etiqueta.getById.useQuery(
    confirmoId,
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
    const etiquetasId = modelo.etiquetas
      .map((etiqueta) => {
        return {
          id: etiqueta.id,
          grupo: {
            id: etiqueta.grupoId,
            esExclusivo: etiqueta.grupo.esExclusivo,
          },
          nombre: etiqueta.nombre,
        };
      })
      .filter((et) => et.id !== confirmoId);

    await editModelo.mutateAsync({
      id: modelo.id,
      etiquetas: [
        ...etiquetasId,
        {
          id: etiquetaAsistio!.id,
          grupo: {
            id: etiquetaAsistio!.grupo.id,
            esExclusivo: etiquetaAsistio!.grupo.esExclusivo,
          },
          nombre: etiquetaAsistio!.nombre,
        },
      ],
    });
    toast.dismiss();
    toast.success('Se confirmó su asistencia');
    useUtils.modelo.getByEtiqueta.invalidate();
  }

  async function deleteAsistencia(
    modelo: RouterOutputs['modelo']['getByEtiqueta'][number]
  ) {
    toast.loading('Eliminando presentismo');
    const etiquetasId = modelo.etiquetas
      .map((etiqueta) => {
        return {
          id: etiqueta.id,
          grupo: {
            id: etiqueta.grupoId,
            esExclusivo: etiqueta.grupo.esExclusivo,
          },
          nombre: etiqueta.nombre,
        };
      })
      .filter((et) => et.id !== asistioId);

    await editModelo.mutateAsync({
      id: modelo.id,
      etiquetas: [
        ...etiquetasId,
        {
          id: confirmoId,
          grupo: {
            id: etiquetaConfirmo!.grupo.id,
            esExclusivo: etiquetaConfirmo!.grupo.esExclusivo,
          },
          nombre: etiquetaConfirmo!.nombre,
        },
      ],
    });
    toast.dismiss();
    toast.success('Se eliminó del presentismo');
    useUtils.modelo.getByEtiqueta.invalidate();
  }

  return (
    <div className='flex items-center justify-center gap-x-2'>
      <input
        type='checkbox'
        disabled={editModelo.isLoading}
        className='h-6 w-6'
        checked={etiquetasId.includes(asistioId)}
        onChange={() =>
          etiquetasId.includes(asistioId)
            ? deleteAsistencia(row.original)
            : addAsistencia(row.original)
        }
      />
    </div>
  );
};

export default CellPresentismo;
