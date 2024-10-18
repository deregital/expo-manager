import AgregarEtiquetasAModelo from '@/components/modelo/AgregarEtiquetasAModelo';
import { useModeloData } from '@/components/modelo/ModeloPageContent';
import ListaEtiquetas from '@/components/ui/ListaEtiquetas';
import { trpc } from '@/lib/trpc';
import { EtiquetaBaseConGrupoColor } from '@/server/types/etiquetas';
import { useState } from 'react';
import { toast } from 'sonner';

interface ListaEtiquetasModeloProps {
  modeloId: string;
  etiquetas: EtiquetaBaseConGrupoColor[];
}

const ListaEtiquetasModelo = ({
  etiquetas,
  modeloId,
}: ListaEtiquetasModeloProps) => {
  const [addEtiquetaOpen, setAddEtiquetaOpen] = useState(false);
  const editModelo = trpc.modelo.edit.useMutation();

  async function handleDelete(
    etiqueta: ListaEtiquetasModeloProps['etiquetas'][number]
  ) {
    useModeloData.setState({
      etiquetas: etiquetas.filter((e) => e.id !== etiqueta.id),
    });
    await editModelo
      .mutateAsync({
        id: modeloId,
        etiquetas: etiquetas
          .filter((e) => e.id !== etiqueta.id)
          .map((e) => ({
            id: e.id,
            nombre: e.nombre,
            grupo: {
              id: e.grupo.id,
              esExclusivo: e.grupo.esExclusivo,
            },
          })),
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
    <ListaEtiquetas
      open={addEtiquetaOpen}
      setOpen={setAddEtiquetaOpen}
      etiquetas={etiquetas}
      handleDelete={handleDelete}
    >
      <AgregarEtiquetasAModelo
        closeAddTag={() => {
          setAddEtiquetaOpen(false);
        }}
        openAddTag={() => {
          setAddEtiquetaOpen(true);
        }}
      />
    </ListaEtiquetas>
  );
};

export default ListaEtiquetasModelo;
