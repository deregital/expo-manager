'use client';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import { Row } from '@tanstack/react-table';
import { toast } from 'sonner';

export const CellPresentismo = ({
  row,
  confirmedId,
  assistedId,
}: {
  row: Row<RouterOutputs['profile']['getByTags'][number]>;
  confirmedId: string;
  assistedId: string;
}) => {
  const tagsId = row.original.tags.map((tag) => tag.id);
  const editProfile = trpc.profile.edit.useMutation();
  const useUtils = trpc.useUtils();

  async function addAsistencia(
    profile: RouterOutputs['profile']['getByTags'][number]
  ) {
    toast.loading('Confirmando asistencia');
    const tagsId = profile.tags
      .map((tag) => tag.id)
      .filter((tagId) => tagId !== confirmedId);

    await editProfile.mutateAsync({
      id: profile.id,
      tags: [...tagsId, assistedId],
    });
    toast.dismiss();
    toast.success('Se confirmó su asistencia');
    useUtils.profile.getByTags.invalidate();
  }

  async function deleteAsistencia(
    profile: RouterOutputs['profile']['getByTags'][number]
  ) {
    toast.loading('Eliminando presentismo');
    const tagsId = profile.tags
      .map((tag) => tag.id)
      .filter((tagId) => tagId !== assistedId);

    await editProfile.mutateAsync({
      id: profile.id,
      tags: [...tagsId, confirmedId],
    });
    toast.dismiss();
    toast.success('Se eliminó del presentismo');
    useUtils.profile.getByTags.invalidate();
  }

  return (
    <div className='flex items-center justify-center gap-x-2'>
      <Input
        type='checkbox'
        disabled={editProfile.isLoading}
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
