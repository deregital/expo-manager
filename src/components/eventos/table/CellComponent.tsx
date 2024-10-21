'use client';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import { Row } from '@tanstack/react-table';
import { CheckIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';

export const CellComponent = ({
  row,
  confirmedAssistanceId,
  assistedId,
}: {
  row: Row<RouterOutputs['modelo']['getAll'][number]>;
  confirmedAssistanceId: string;
  assistedId: string;
}) => {
  const tagsId = row.original.etiquetas.map((tag: any) => tag.id);
  const { data: tagConfirmed } = trpc.tag.getById.useQuery(
    confirmedAssistanceId,
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
    const tagsId = modelo.etiquetas.map((tag) => {
      return {
        id: tag.id,
        grupo: {
          id: tag.grupoId,
          esExclusivo: tag.grupo.esExclusivo,
        },
        nombre: tag.nombre,
      };
    });
    await editModelo.mutateAsync({
      id: modelo.id,
      etiquetas: [
        ...tagsId,
        {
          id: tagConfirmed!.id,
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
    toast.success('Se agregó al presentismo');
    useUtils.modelo.getAll.invalidate();
    useUtils.modelo.getByEtiqueta.invalidate();
  }

  return (
    <div className='flex flex-wrap items-center justify-center gap-1'>
      {tagsId.includes(confirmedAssistanceId) || tagsId.includes(assistedId) ? (
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
