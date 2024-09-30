import ComboBox from '@/components/ui/ComboBox';
import { cn } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import { Trash } from 'lucide-react';
import React from 'react';
import { create } from 'zustand';

interface ModelosComboYListProps {
  modelos: RouterOutputs['modelo']['getAll'];
  modelosLoading: boolean;
}

export const asignacionComboBoxOpens = create<{
  modelos: boolean;
  grupos: boolean;
  etiquetas: boolean;
  setModelosOpen: (open: boolean) => void;
  setGruposOpen: (open: boolean) => void;
  setEtiquetasOpen: (open: boolean) => void;
}>((set) => ({
  modelos: false,
  grupos: false,
  etiquetas: false,
  setModelosOpen: (open: boolean) => set({ modelos: open }),
  setGruposOpen: (open: boolean) => set({ grupos: open }),
  setEtiquetasOpen: (open: boolean) => set({ etiquetas: open }),
}));

export const asignacionSelectedData = create<{
  modelos: RouterOutputs['modelo']['getAll'];
  etiquetas: RouterOutputs['etiqueta']['getAll'];
  grupo: RouterOutputs['grupoEtiqueta']['getAll'][number] | undefined;
  setModelos: (modelos: RouterOutputs['modelo']['getAll'][number]) => void;
  setEtiquetas: (
    etiquetas: RouterOutputs['etiqueta']['getAll'][number]
  ) => void;
  setGrupo: (grupo: RouterOutputs['grupoEtiqueta']['getAll'][number]) => void;
  clearModelos: () => void;
  clearEtiquetas: () => void;
  clearGrupo: () => void;
}>((set, get) => ({
  modelos: [],
  etiquetas: [],
  etiquetasList: [],
  grupo: undefined,
  setModelos: (modelos) => {
    if (get().modelos.find((m) => m.id === modelos.id)) {
      set({
        modelos: get().modelos.filter((m) => m.id !== modelos.id),
      });
      return;
    } else {
      set({
        modelos: [...get().modelos, modelos],
      });
    }
  },
  setEtiquetas: (etiquetas) => {
    if (get().etiquetas.find((e) => e.id === etiquetas.id)) {
      set({
        etiquetas: get().etiquetas.filter((e) => e.id !== etiquetas.id),
      });
      return;
    } else {
      set({
        etiquetas: [...get().etiquetas, etiquetas],
      });
    }
  },
  setGrupo: (grupo) => {
    if (get().grupo === grupo) {
      set({
        grupo: undefined,
      });
    } else {
      set({
        grupo,
      });
    }
  },
  clearModelos: () => set({ modelos: [] }),
  clearEtiquetas: () => set({ etiquetas: [] }),
  clearGrupo: () => set({ grupo: undefined }),
}));

const ModelosComboYList = ({
  modelos,
  modelosLoading,
}: ModelosComboYListProps) => {
  const { modelos: modelosOpen, setModelosOpen } = asignacionComboBoxOpens();
  const { modelos: modelosList, setModelos } = asignacionSelectedData();

  return (
    <>
      <ComboBox
        open={modelosOpen}
        setOpen={setModelosOpen}
        isLoading={modelosLoading}
        triggerChildren={<p>Modelos</p>}
        notFoundText='No hay participantes disponibles'
        placeholder='Buscar participantes...'
        data={modelos ?? []}
        id='id'
        value='nombreCompleto'
        onSelect={(value) => {
          setModelos(
            modelos!.find(
              (m) => m.id === value
            ) as RouterOutputs['modelo']['getAll'][number]
          );
          setModelosOpen(false);
        }}
        selectedIf={''}
      />
      <div
        className={cn(
          modelosList.length > 0 && 'mt-2 rounded-md border border-gray-500'
        )}
      >
        {modelosList.map((modelo) => (
          <div className='flex w-full justify-between p-1' key={modelo.id}>
            <p>{modelo.nombreCompleto}</p>
            <Trash
              className='cursor-pointer fill-red-500 text-red-900'
              onClick={() => setModelos(modelo)}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default ModelosComboYList;
