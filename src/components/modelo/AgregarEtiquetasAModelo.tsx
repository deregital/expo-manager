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
  const { etiquetas, modeloId } = useProfileData((state) => ({
    etiquetas: state.tags,
    modeloId: state.id,
  }));
  const addEtiqueta = trpc.modelo.edit.useMutation();
  const utils = trpc.useUtils();

  async function handleAddEtiqueta(
    addedEtiqueta: NonNullable<
      RouterOutputs['modelo']['getById']
    >['tags'][number]
  ) {
    useProfileData.setState({
      tags: [...etiquetas, addedEtiqueta],
    });

    closeAddTag();

    await addEtiqueta
      .mutateAsync({
        id: modeloId,
        etiquetas: [
          ...etiquetas.map((e) => ({
            id: e.id,
            nombre: e.name,
            grupo: {
              id: e.group.id,
              esExclusivo: e.group.isExclusive,
            },
          })),
          {
            id: addedEtiqueta.id,
            name: addedEtiqueta.name,
            group: {
              id: addedEtiqueta.group.id,
              isExclusive: addedEtiqueta.group.isExclusive,
            },
          },
        ],
      })
      .then(() => {
        toast.success('Etiqueta agregada con éxito');
        utils.modelo.getById.invalidate(modeloId);
        utils.modelo.getByFiltro.invalidate();
      })
      .catch(() => {
        useProfileData.setState({
          tags: etiquetas.filter((e) => e.id !== addedEtiqueta.id),
        });
        openAddTag();
        toast.error('Error al agregar la etiqueta');
      });
  }

  return (
    <AddEtiquetaCombos tags={etiquetas} handleAddTag={handleAddEtiqueta} />
  );
};

export default AgregarEtiquetasAModelo;
