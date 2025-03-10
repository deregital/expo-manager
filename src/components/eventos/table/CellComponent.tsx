'use client';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { type RouterOutputs } from '@/server';
import { type Row } from '@tanstack/react-table';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { toast } from 'sonner';

export const CellComponent = ({
  row,
  confirmedAssistanceId,
  assistedId,
}: {
  row: Row<RouterOutputs['profile']['getByTags'][number]>;
  confirmedAssistanceId: string;
  assistedId: string;
}) => {
  const tagsId = row.original.tags.map((tag) => tag.id);
  const editProfile = trpc.profile.edit.useMutation();
  const useUtils = trpc.useUtils();

  async function addPresentismo(
    profile: RouterOutputs['profile']['getByTags'][number]
  ) {
    toast.loading('Agregando al presentismo');
    const tagsId = profile.tags.map((tag) => tag.id);
    await editProfile.mutateAsync({
      id: profile.id,
      tags: [...tagsId, confirmedAssistanceId],
    });
    toast.dismiss();
    toast.success('Se agregó al presentismo');
    useUtils.profile.getAll.invalidate();
    useUtils.profile.getByTags.invalidate();
  }

  async function removePresentismo(
    profile: RouterOutputs['profile']['getByTags'][number]
  ) {
    toast.loading('Removiendo del presentismo');
    const tagsId = profile.tags.map((tag) => tag.id);
    await editProfile.mutateAsync({
      id: profile.id,
      tags: tagsId.filter((tagId) => tagId !== confirmedAssistanceId),
    });
    toast.dismiss();
    toast.success('Se removió del presentismo');
    useUtils.profile.getAll.invalidate();
    useUtils.profile.getByTags.invalidate();
  }

  return (
    <div className='flex flex-wrap items-center justify-center gap-1'>
      {tagsId.includes(confirmedAssistanceId) || tagsId.includes(assistedId) ? (
        <div className='flex items-center justify-center gap-x-2'>
          <p>En presentismo</p>
          {/* <CheckIcon className='h-6 w-6' /> */}
          <Button
            disabled={editProfile.isLoading}
            variant={'destructive'}
            className='aspect-square px-1'
            onClick={() => {
              if (!row.original.id) {
                toast.error('No se ha encontrado el participante');
                return;
              }
              removePresentismo(row.original);
            }}
          >
            <TrashIcon className='h-6 w-6' />
          </Button>
        </div>
      ) : (
        <>
          <Button
            disabled={editProfile.isLoading}
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
