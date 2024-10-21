import AgregarEtiquetasAFiltroBase from '@/components/configuracion/AgregarEtiquetasAFiltroBase';
import ListaEtiquetas from '@/components/ui/ListaEtiquetas';
import Loader from '@/components/ui/loader';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/lib/trpc';
import { EtiquetaBaseConGrupoColor } from '@/server/types/etiquetas';
import { useState } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';

interface ActualizarFiltroBaseProps {}

export const useTagsGlobalFilter = create<{
  tags: EtiquetaBaseConGrupoColor[];
  active: boolean;
  addTag: (tag: EtiquetaBaseConGrupoColor) => void;
  removeTag: (tag: EtiquetaBaseConGrupoColor) => void;
}>((set) => ({
  tags: [],
  active: false,
  addTag: (tag: EtiquetaBaseConGrupoColor) => {
    set((state) => ({
      tags: [...state.tags, tag],
    }));
  },
  removeTag: (tag: EtiquetaBaseConGrupoColor) => {
    set((state) => ({
      tags: state.tags.filter((e) => e.id !== tag.id),
    }));
  },
}));

const ActualizarFiltroBase = ({}: ActualizarFiltroBaseProps) => {
  const utils = trpc.useUtils();
  const filtroBaseMutation = trpc.cuenta.updateFiltroBase.useMutation();
  const { data: filtroBaseData, isLoading: filtroBaseLoading } =
    trpc.cuenta.getFiltroBase.useQuery(undefined, {
      onSuccess: (data) => {
        useTagsGlobalFilter.setState({
          active: data.activo,
          tags: data.etiquetas,
        });
      },
    });
  const [open, setOpen] = useState(false);
  const { removeTag, tags, addTag, active } = useTagsGlobalFilter();

  async function handleDelete(tag: EtiquetaBaseConGrupoColor) {
    removeTag(tag);
    await filtroBaseMutation
      .mutateAsync({
        activo: active,
        etiquetas: filtroBaseData?.etiquetas
          ?.filter((e) => e.id !== tag.id)
          .map((e) => e.id),
      })
      .then(() => {
        toast.success(`Etiqueta ${tag.nombre} eliminada`);
        utils.modelo.invalidate();
        utils.cuenta.getFiltroBase.invalidate();
      })
      .catch(() => {
        addTag(tag);
        toast.error('Error al eliminar etiqueta');
      });
  }

  return (
    <div>
      <div className='flex flex-col'>
        <div className='flex items-center gap-x-3'>
          <h1 className='text-2xl font-bold'>Filtro base</h1>
          <Switch
            disabled={filtroBaseLoading}
            checked={active}
            onCheckedChange={async (checked: boolean | 'indeterminate') => {
              // if (checked === 'indeterminate') return;
              useTagsGlobalFilter.setState({
                active: checked === 'indeterminate' ? active : checked,
              });
              await filtroBaseMutation
                .mutateAsync({
                  activo: checked === 'indeterminate' ? false : checked,
                  etiquetas: tags.map((e) => e.id),
                })
                .then(() => {
                  utils.cuenta.getFiltroBase.invalidate();
                  utils.modelo.invalidate();
                  toast.success(
                    checked ? 'Filtro activado' : 'Filtro desactivado'
                  );
                });
            }}
          />
        </div>
        {filtroBaseLoading ? (
          <Loader />
        ) : (
          filtroBaseData && (
            <ListaEtiquetas
              open={open}
              setOpen={setOpen}
              handleDelete={handleDelete}
              etiquetas={tags}
            >
              <AgregarEtiquetasAFiltroBase
                closeAddTag={() => setOpen(false)}
                openAddTag={() => setOpen(true)}
              />
            </ListaEtiquetas>
          )
        )}
      </div>
    </div>
  );
};

export default ActualizarFiltroBase;
