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
  const tagsId = row.original.tags.map((tag) => tag.id);
  const editModelo = trpc.modelo.edit.useMutation();
  const useUtils = trpc.useUtils();

  async function addPresentismo(
    profile: RouterOutputs['modelo']['getAll'][number]
  ) {
    toast.loading('Agregando al presentismo');
    const tagsId = profile.tags.map((tag) => tag.id);
    await editModelo.mutateAsync({
      id: profile.id,
      tags: [...tagsId, confirmedAssistanceId],
    });
    toast.dismiss();
    toast.success('Se agregó al presentismo');
    useUtils.modelo.getAll.invalidate();
    useUtils.modelo.getByTags.invalidate();
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
