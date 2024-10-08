'use client';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import { Row } from '@tanstack/react-table';
import { CheckIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';

export const CellComponent = ({
  row,
  confirmoAsistenciaId,
  asistioId,
}: {
  row: Row<RouterOutputs['modelo']['getAll'][number]>;
  confirmoAsistenciaId: string;
  asistioId: string;
}) => {
  const etiquetasId = row.original.etiquetas.map(
    (etiqueta: any) => etiqueta.id
  );
  const { data: etiquetaConfirmo } = trpc.etiqueta.getById.useQuery(
    confirmoAsistenciaId,
    {
      enabled: !!row.original,
    }
  );
  const editModelo = trpc.modelo.edit.useMutation();
  const useUtils = trpc.useUtils();

  async function addPresentismo(
    modelo: RouterOutputs['modelo']['getAll'][number]
  ) {
    toast.loading('Agregando al presentismo');
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
          id: etiquetaConfirmo!.id,
          grupo: {
            id: etiquetaConfirmo!.grupo.id,
            esExclusivo: etiquetaConfirmo!.grupo.esExclusivo,
          },
          nombre: etiquetaConfirmo!.nombre,
        },
      ],
    });
    toast.dismiss();
    toast.success('Se agregó al presentismo');
    useUtils.modelo.getAll.invalidate();
    useUtils.modelo.getByEtiqueta.invalidate();
  }

  return (
    <div className='flex flex-wrap items-center justify-center gap-1'>
      {etiquetasId.includes(confirmoAsistenciaId) ||
      etiquetasId.includes(asistioId) ? (
        <div className='flex items-center justify-center gap-x-2'>
          <p>En presentismo</p>
          <CheckIcon className='h-6 w-6' />
        </div>
      ) : (
        <>
          <Button
            disabled={editModelo.isLoading}
            className='px-1'
            onClick={() => {
              if (!row.original.id) {
                toast.error('No se ha encontrado el participante');
                return;
              }
              addPresentismo(row.original);
            }}
          >
            Agregar al presentismo
            <PlusIcon className='h-6 w-6' />
          </Button>
        </>
      )}
    </div>
  );
};

export default CellComponent;
