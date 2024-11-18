import AgregarEtiquetasAFiltroBase from '@/components/configuracion/AgregarEtiquetasAFiltroBase';
import ListaEtiquetas from '@/components/ui/ListaEtiquetas';
import Loader from '@/components/ui/loader';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/lib/trpc';
import { type RouterOutputs } from '@/server';
import { type GetGlobalFilterResponseDto } from 'expo-backend-types';
import { useState } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';

interface ActualizarFiltroBaseProps {}

export const useTagsGlobalFilter = create<{
  tags: RouterOutputs['cuenta']['getFiltroBase']['globalFilter'];
  active: boolean;
  addTag: (
    tag: RouterOutputs['cuenta']['getFiltroBase']['globalFilter'][number]
  ) => void;
  removeTag: (
    tag: RouterOutputs['cuenta']['getFiltroBase']['globalFilter'][number]
  ) => void;
}>((set) => ({
  tags: [],
  active: false,
  addTag: (
    tag: RouterOutputs['cuenta']['getFiltroBase']['globalFilter'][number]
  ) => {
    set((state) => ({
      tags: [...state.tags, tag],
    }));
  },
  removeTag: (
    tag: RouterOutputs['cuenta']['getFiltroBase']['globalFilter'][number]
  ) => {
    set((state) => ({
      tags: state.tags.filter((e) => e.id !== tag.id),
    }));
  },
}));

const ActualizarFiltroBase = ({}: ActualizarFiltroBaseProps) => {
  const utils = trpc.useUtils();
  const filtroBaseMutation = trpc.cuenta.updateFiltroBase.useMutation();
  const { data: globalFilterData, isLoading: globalFilterActive } =
    trpc.cuenta.getFiltroBase.useQuery(undefined, {
      onSuccess: (data) => {
        useTagsGlobalFilter.setState({
          active: data?.isGlobalFilterActive,
          tags: data?.globalFilter || [],
        });
      },
    });
  const [open, setOpen] = useState(false);
  const { removeTag, tags, addTag, active } = useTagsGlobalFilter();

  async function handleDelete(
    tag: GetGlobalFilterResponseDto['globalFilter'][number]
  ) {
    removeTag(tag);
    await filtroBaseMutation
      .mutateAsync({
        activo: active,
        etiquetas: globalFilterData?.globalFilter
          ?.filter((t) => t.id !== tag.id)
          .map((t) => t.id),
      })
      .then(() => {
        toast.success(`Etiqueta ${tag.name} eliminada`);
        utils.profile.invalidate();
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
            disabled={globalFilterActive}
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
                  utils.profile.invalidate();
                  toast.success(
                    checked ? 'Filtro activado' : 'Filtro desactivado'
                  );
                });
            }}
          />
        </div>
        {globalFilterActive ? (
          <Loader />
        ) : (
          globalFilterData && (
            <ListaEtiquetas
              open={open}
              setOpen={setOpen}
              handleDelete={handleDelete}
              tags={tags}
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
