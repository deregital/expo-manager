import AddEtiquetaCombos from '@/components/ui/AddEtiquetaCombos';
import { useProfileData } from '@/components/modelo/ModeloPageContent';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import React from 'react';
import { toast } from 'sonner';

interface AgregarEtiquetasAModeloProps {
  closeAddTag: () => void;
  openAddTag: () => void;
}

const AgregarEtiquetasAModelo = ({
  closeAddTag,
  openAddTag,
}: AgregarEtiquetasAModeloProps) => {
  const { tags, profileId } = useProfileData((state) => ({
    tags: state.tags,
    profileId: state.id,
  }));
  const addEtiqueta = trpc.modelo.edit.useMutation();
  const utils = trpc.useUtils();

  async function handleAddEtiqueta(
    addedEtiqueta: NonNullable<
      RouterOutputs['modelo']['getById']
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
        utils.modelo.getById.invalidate(profileId);
        utils.modelo.getByFiltro.invalidate();
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

export default AgregarEtiquetasAModelo;
