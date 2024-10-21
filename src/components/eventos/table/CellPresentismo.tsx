'use client';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import { Row } from '@tanstack/react-table';
import { toast } from 'sonner';

export const CellPresentismo = ({
  row,
  confirmedId,
  assistedId,
}: {
  row: Row<RouterOutputs['modelo']['getByEtiqueta'][number]>;
  confirmedId: string;
  assistedId: string;
}) => {
  const tagsId = row.original.etiquetas.map((tag: any) => tag.id);
  const { data: tagAssisted } = trpc.tag.getById.useQuery(assistedId, {
    enabled: !!row.original,
  });
  const { data: tagConfirmed } = trpc.tag.getById.useQuery(confirmedId, {
    enabled: !!row.original,
  });
  const editModelo = trpc.modelo.edit.useMutation();
  const useUtils = trpc.useUtils();

  async function addAsistencia(
    modelo: RouterOutputs['modelo']['getByEtiqueta'][number]
  ) {
    toast.loading('Confirmando asistencia');
    const tagsId = modelo.etiquetas
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
      .filter((et) => et.id !== confirmedId);

    await editModelo.mutateAsync({
      id: modelo.id,
      etiquetas: [
        ...tagsId,
        {
          id: tagAssisted!.id,
          grupo: {
            // TODO: Fix this
            id: tagAssisted!.group.id as string,
            esExclusivo: tagAssisted!.group.isExclusive as boolean,
          },
          nombre: tagAssisted!.name,
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
      .filter((et) => et.id !== assistedId);

    await editModelo.mutateAsync({
      id: modelo.id,
      etiquetas: [
        ...etiquetasId,
        {
          id: confirmedId,
          grupo: {
            // TODO: Fix this
            id: tagConfirmed!.group.id as string,
            esExclusivo: tagConfirmed!.group.isExclusive as boolean,
          },
          nombre: tagConfirmed!.name,
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
        checked={tagsId.includes(assistedId)}
        onChange={() =>
          tagsId.includes(assistedId)
            ? deleteAsistencia(row.original)
            : addAsistencia(row.original)
        }
      />
    </div>
  );
};

export default CellPresentismo;
