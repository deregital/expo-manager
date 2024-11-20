import { useTagsGlobalFilter } from '@/components/configuracion/ActualizarFiltroBase';
import AddEtiquetaCombos from '@/components/ui/AddEtiquetaCombos';
import { trpc } from '@/lib/trpc';
import { type RouterOutputs } from '@/server';
import React from 'react';
import { toast } from 'sonner';

interface AgregarEtiquetasAFiltroBaseProps {
  closeAddTag: () => void;
  openAddTag: () => void;
}

const AgregarEtiquetasAFiltroBase = ({
  closeAddTag,
  openAddTag,
}: AgregarEtiquetasAFiltroBaseProps) => {
  const { tags, addTag, removeTag, active } = useTagsGlobalFilter();
  const addTagMutation = trpc.account.updateGlobalFilter.useMutation();
  const utils = trpc.useUtils();

  async function handleAddTag(
    addedTag: NonNullable<RouterOutputs['profile']['getById']>['tags'][number]
  ) {
    addTag(addedTag);
    closeAddTag();
    await addTagMutation
      .mutateAsync({
        active,
        tagsIds: tags.map((e) => e.id).concat(addedTag.id),
      })
      .then(() => {
        toast.success(`Etiqueta ${addedTag.name} agregada con éxito`);
        utils.profile.invalidate();
        utils.account.getGlobalFilter.invalidate();
      })
      .catch(() => {
        removeTag(addedTag);
        toast.error('Error al agregar etiqueta');
        openAddTag();
      });
  }

  return <AddEtiquetaCombos tags={tags} handleAddTag={handleAddTag} />;
};

export default AgregarEtiquetasAFiltroBase;
