import { Badge } from '@/components/ui/badge';
import { getTextColorByBg } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import CircleXIcon from '@/components/icons/CircleX';
import React from 'react';
import { useModeloData } from '@/components/modelo/ModeloPageContent';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ListaEtiquetasProps {
  modeloId: string;
  etiquetas: NonNullable<RouterOutputs['modelo']['getById']>['etiquetas'];
}

const ListaEtiquetas = ({ etiquetas, modeloId }: ListaEtiquetasProps) => {
  const editModelo = trpc.modelo.edit.useMutation();

  async function handleDelete(
    etiqueta: ListaEtiquetasProps['etiquetas'][number]
  ) {
    useModeloData.setState({
      etiquetas: etiquetas.filter((e) => e.id !== etiqueta.id),
    });
    await editModelo
      .mutateAsync({
        id: modeloId,
        etiquetas: etiquetas
          .filter((e) => e.id !== etiqueta.id)
          .map((e) => e.id),
      })
      .then(() => toast.success(`Etiqueta ${etiqueta.nombre} eliminada`))
      .catch(() => {
        useModeloData.setState({
          etiquetas: [...etiquetas, etiqueta],
        });
        toast.error('Error al eliminar etiqueta');
      });
  }

  return etiquetas?.map((etiqueta) => (
    <Badge
      className='group transition-transform duration-200 ease-in-out hover:shadow-md'
      style={{
        backgroundColor: etiqueta.grupo.color,
        color: getTextColorByBg(etiqueta.grupo.color),
      }}
      key={etiqueta.id}
    >
      {etiqueta.nombre}

      <CircleXIcon
        onClick={() => handleDelete(etiqueta)}
        className='invisible w-0 cursor-pointer group-hover:visible group-hover:ml-1 group-hover:w-4'
        width={16}
        height={16}
      />
    </Badge>
  ));
};

export default ListaEtiquetas;
