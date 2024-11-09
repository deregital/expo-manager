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
  row: Row<RouterOutputs['modelo']['getByTags'][number]>;
  confirmedId: string;
  assistedId: string;
}) => {
  const tagsId = row.original.tags.map((tag) => tag.id);
  const { data: tagAssisted } = trpc.tag.getById.useQuery(assistedId, {
    enabled: !!row.original,
  });
  const { data: tagConfirmed } = trpc.tag.getById.useQuery(confirmedId, {
    enabled: !!row.original,
  });
  const editProfile = trpc.modelo.edit.useMutation();
  const useUtils = trpc.useUtils();

  async function addAsistencia(
    profile: RouterOutputs['modelo']['getByTags'][number]
  ) {
    toast.loading('Confirmando asistencia');
    const tagsId = profile.tags
      .map((tag) => {
        return {
          id: tag.id,
          grupo: {
            id: tag.groupId,
            esExclusivo: tag.group.isExclusive,
          },
          nombre: tag.name,
        };
      })
      .filter((et) => et.id !== confirmedId);

    await editProfile.mutateAsync({
      id: profile.id,
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
    useUtils.modelo.getByTags.invalidate();
  }

  async function deleteAsistencia(
    profile: RouterOutputs['modelo']['getByTags'][number]
  ) {
    toast.loading('Eliminando presentismo');
    const tagsId = profile.tags
      .map((tag) => {
        return {
          id: tag.id,
          grupo: {
            id: tag.groupId,
            esExclusivo: tag.group.isExclusive,
          },
          nombre: tag.name,
        };
      })
      .filter((et) => et.id !== assistedId);

    await editProfile.mutateAsync({
      id: profile.id,
      etiquetas: [
        ...tagsId,
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
    useUtils.modelo.getByTags.invalidate();
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
