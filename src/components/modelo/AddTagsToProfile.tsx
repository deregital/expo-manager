import AddEtiquetaCombos from '@/components/ui/AddEtiquetaCombos';
import { useProfileData } from '@/components/modelo/ProfilePageContent';
import { trpc } from '@/lib/trpc';
import { type RouterOutputs } from '@/server';
import React from 'react';
import { toast } from 'sonner';

interface AddTagsToProfileProps {
  closeAddTag: () => void;
  openAddTag: () => void;
}

const AddTagsToProfile = ({
  closeAddTag,
  openAddTag,
}: AddTagsToProfileProps) => {
  const { tags, profileId } = useProfileData((state) => ({
    tags: state.tags,
    profileId: state.id,
  }));
  const addEtiqueta = trpc.profile.edit.useMutation();
  const utils = trpc.useUtils();

  async function handleAddEtiqueta(
    addedEtiqueta: NonNullable<
      RouterOutputs['profile']['getById']
    >['tags'][number]
  ) {
    useProfileData.setState({
      tags: [...tags, addedEtiqueta],
    });

    closeAddTag();

    await addEtiqueta
      .mutateAsync({
        id: profileId,
        tags: [...tags.map((e) => e.id), addedEtiqueta.id],
      })
      .then(() => {
        toast.success('Etiqueta agregada con éxito');
        utils.profile.getById.invalidate(profileId);
      })
      .catch(() => {
        useProfileData.setState({
          tags: tags.filter((e) => e.id !== addedEtiqueta.id),
        });
        openAddTag();
        toast.error('Error al agregar la etiqueta');
      });
  }

  return <AddEtiquetaCombos tags={tags} handleAddTag={handleAddEtiqueta} />;
};

export default AddTagsToProfile;
