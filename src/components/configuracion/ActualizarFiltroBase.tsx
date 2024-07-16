import AgregarEtiquetasAFiltroBase from '@/components/configuracion/AgregarEtiquetasAFiltroBase';
import ListaEtiquetas from '@/components/ui/ListaEtiquetas';
import { Checkbox } from '@/components/ui/checkbox';
import Loader from '@/components/ui/loader';
import { trpc } from '@/lib/trpc';
import { EtiquetaBaseConGrupoColor } from '@/server/types/etiquetas';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';

interface ActualizarFiltroBaseProps {}

export const useEtiquetasFiltroBase = create<{
  etiquetas: EtiquetaBaseConGrupoColor[];
  activo: boolean;
  agregarEtiqueta: (etiqueta: EtiquetaBaseConGrupoColor) => void;
  eliminarEtiqueta: (etiqueta: EtiquetaBaseConGrupoColor) => void;
}>((set) => ({
  etiquetas: [],
  activo: false,
  agregarEtiqueta: (etiqueta: EtiquetaBaseConGrupoColor) => {
    set((state) => ({
      etiquetas: [...state.etiquetas, etiqueta],
    }));
  },
  eliminarEtiqueta: (etiqueta: EtiquetaBaseConGrupoColor) => {
    set((state) => ({
      etiquetas: state.etiquetas.filter((e) => e.id !== etiqueta.id),
    }));
  },
}));

const ActualizarFiltroBase = ({}: ActualizarFiltroBaseProps) => {
  const utils = trpc.useUtils();
  const filtroBaseMutation = trpc.cuenta.updateFiltroBase.useMutation();
  const { data: filtroBaseData, isLoading: filtroBaseLoading } =
    trpc.cuenta.getFiltroBase.useQuery(undefined, {
      onSuccess: (data) => {
        useEtiquetasFiltroBase.setState({
          activo: data.activo,
          etiquetas: data.etiquetas,
        });
      },
    });
  const [open, setOpen] = useState(false);
  const { eliminarEtiqueta, etiquetas, agregarEtiqueta, activo } =
    useEtiquetasFiltroBase();

  async function handleDelete(etiqueta: EtiquetaBaseConGrupoColor) {
    eliminarEtiqueta(etiqueta);
    await filtroBaseMutation
      .mutateAsync({
        activo,
        etiquetas: filtroBaseData?.etiquetas
          ?.filter((e) => e.id !== etiqueta.id)
          .map((e) => e.id),
      })
      .then(() => {
        toast.success(`Etiqueta ${etiqueta.nombre} eliminada`);
        utils.modelo.invalidate();
        utils.cuenta.getFiltroBase.invalidate();
      })
      .catch(() => {
        agregarEtiqueta(etiqueta);
        toast.error('Error al eliminar etiqueta');
      });
  }

  return (
    <div>
      <div className='flex flex-col'>
        <div className='flex items-center gap-x-3'>
          <h1 className='text-2xl font-bold'>Filtro base</h1>
          <Checkbox
            disabled={filtroBaseLoading}
            checked={activo}
            onCheckedChange={async (checked: boolean | 'indeterminate') => {
              // if (checked === 'indeterminate') return;
              useEtiquetasFiltroBase.setState({
                activo: checked === 'indeterminate' ? activo : checked,
              });
              await filtroBaseMutation
                .mutateAsync({
                  activo: checked === 'indeterminate' ? false : checked,
                  etiquetas: etiquetas.map((e) => e.id),
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
              etiquetas={etiquetas}
            >
              <AgregarEtiquetasAFiltroBase
                closeAddEtiqueta={() => setOpen(false)}
                openAddEtiqueta={() => setOpen(true)}
              />
            </ListaEtiquetas>
          )
        )}
      </div>
    </div>
  );
};

export default ActualizarFiltroBase;
