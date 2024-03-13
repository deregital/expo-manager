import { Badge } from '@/components/ui/badge';
import { getTextColorByBg } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import CircleXIcon from '@/components/icons/CircleX';
import React, { useState } from 'react';
import { useModeloData } from '@/components/modelo/ModeloPageContent';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import CirclePlus from '@/components/icons/CirclePlus';
import AddEtiquetaCombos from '@/components/modelo/AddEtiquetaCombos';

interface ListaEtiquetasProps {
  modeloId: string;
  etiquetas: NonNullable<RouterOutputs['modelo']['getById']>['etiquetas'];
}

const ListaEtiquetas = ({ etiquetas, modeloId }: ListaEtiquetasProps) => {
  const editModelo = trpc.modelo.edit.useMutation();
  const [addEtiquetaOpen, setAddEtiquetaOpen] = useState(false);

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

  return (
    <div className='w-full'>
      <div className='flex flex-wrap items-center gap-2'>
        {etiquetas?.map((etiqueta) => (
          <Badge
            className='group whitespace-nowrap transition-transform duration-200 ease-in-out hover:shadow-md'
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
        ))}
        {!addEtiquetaOpen ? (
          <CirclePlus
            className='h-5 w-5 cursor-pointer'
            onClick={() => setAddEtiquetaOpen(true)}
          />
        ) : (
          <CircleXIcon
            className='h-5 w-5 cursor-pointer'
            onClick={() => setAddEtiquetaOpen(false)}
          />
        )}
      </div>

      {addEtiquetaOpen && (
        <AddEtiquetaCombos
          closeAddEtiqueta={() => {
            setAddEtiquetaOpen(false);
          }}
          openAddEtiqueta={() => {
            setAddEtiquetaOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default ListaEtiquetas;
