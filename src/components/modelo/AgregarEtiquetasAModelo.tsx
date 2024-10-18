import AddEtiquetaCombos from '@/components/ui/AddEtiquetaCombos';
import { useModeloData } from '@/components/modelo/ModeloPageContent';
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
  const { etiquetas, modeloId } = useModeloData((state) => ({
    etiquetas: state.etiquetas,
    modeloId: state.id,
  }));
  const addEtiqueta = trpc.modelo.edit.useMutation();
  const utils = trpc.useUtils();

  async function handleAddEtiqueta(
    addedEtiqueta: NonNullable<
      RouterOutputs['modelo']['getById']
    >['etiquetas'][number]
  ) {
    useModeloData.setState({
      etiquetas: [...etiquetas, addedEtiqueta],
    });

    closeAddTag();

    await addEtiqueta
      .mutateAsync({
        id: modeloId,
        etiquetas: [
          ...etiquetas.map((e) => ({
            id: e.id,
            nombre: e.nombre,
            grupo: {
              id: e.grupo.id,
              esExclusivo: e.grupo.esExclusivo,
            },
          })),
          {
            id: addedEtiqueta.id,
            nombre: addedEtiqueta.nombre,
            grupo: {
              id: addedEtiqueta.grupo.id,
              esExclusivo: addedEtiqueta.grupo.esExclusivo,
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
        useModeloData.setState({
          etiquetas: etiquetas.filter((e) => e.id !== addedEtiqueta.id),
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
