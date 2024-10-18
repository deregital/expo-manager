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
  groups: boolean;
  tags: boolean;
  setModelosOpen: (open: boolean) => void;
  setGroupsOpen: (open: boolean) => void;
  setTags: (open: boolean) => void;
}>((set) => ({
  modelos: false,
  groups: false,
  tags: false,
  setModelosOpen: (open: boolean) => set({ modelos: open }),
  setGroupsOpen: (open: boolean) => set({ groups: open }),
  setTags: (open: boolean) => set({ tags: open }),
}));

export const asignacionSelectedData = create<{
  modelos: RouterOutputs['modelo']['getAll'];
  tags: RouterOutputs['tag']['getAll'];
  tagsList: RouterOutputs['tag']['getAll'];
  group: RouterOutputs['tagGroup']['getAll'][number] | undefined;
  setModelos: (modelos: RouterOutputs['modelo']['getAll'][number]) => void;
  setTags: (tags: RouterOutputs['tag']['getAll'][number]) => void;
  setGroup: (group: RouterOutputs['tagGroup']['getAll'][number]) => void;
  clearModelos: () => void;
  clearTags: () => void;
  clearGroup: () => void;
}>((set, get) => ({
  modelos: [],
  tags: [],
  tagsList: [],
  group: undefined,
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
  setTags: (tag) => {
    if (get().tags.find((t) => t.id === tag.id)) {
      set({
        tags: get().tags.filter((t) => t.id !== tag.id),
      });
      return;
    } else {
      set({
        tags: [...get().tags, tag],
      });
    }
  },
  setGroup: (group) => {
    if (get().group === group) {
      set({
        group: undefined,
      });
    } else {
      set({
        group: group,
      });
    }
  },
  clearModelos: () => set({ modelos: [] }),
  clearTags: () => set({ tags: [] }),
  clearGroup: () => set({ group: undefined }),
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
