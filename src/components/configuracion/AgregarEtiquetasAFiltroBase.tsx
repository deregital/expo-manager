import { useEtiquetasFiltroBase } from '@/components/configuracion/ActualizarFiltroBase';
import AddEtiquetaCombos from '@/components/ui/AddEtiquetaCombos';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import React from 'react';
import { toast } from 'sonner';

interface AgregarEtiquetasAFiltroBaseProps {
  closeAddEtiqueta: () => void;
  openAddEtiqueta: () => void;
}

const AgregarEtiquetasAFiltroBase = ({
  closeAddEtiqueta,
  openAddEtiqueta,
}: AgregarEtiquetasAFiltroBaseProps) => {
  const { etiquetas, agregarEtiqueta, eliminarEtiqueta, activo } =
    useEtiquetasFiltroBase();
  const agregarEtiquetaMutation = trpc.cuenta.updateFiltroBase.useMutation();
  const utils = trpc.useUtils();

  async function handleAddEtiqueta(
    addedEtiqueta: NonNullable<
      RouterOutputs['modelo']['getById']
    >['etiquetas'][number]
  ) {
    agregarEtiqueta(addedEtiqueta);
    closeAddEtiqueta();
    await agregarEtiquetaMutation
      .mutateAsync({
        activo,
        etiquetas: etiquetas.map((e) => e.id).concat(addedEtiqueta.id),
      })
      .then(() => {
        toast.success(`Etiqueta ${addedEtiqueta.nombre} agregada con éxito`);
        utils.modelo.invalidate();
        utils.cuenta.getFiltroBase.invalidate();
      })
      .catch(() => {
        eliminarEtiqueta(addedEtiqueta);
        toast.error('Error al agregar etiqueta');
        openAddEtiqueta();
      });
  }

  return (
    <AddEtiquetaCombos
      etiquetas={etiquetas}
      handleAddEtiqueta={handleAddEtiqueta}
    />
  );
};

export default AgregarEtiquetasAFiltroBase;
