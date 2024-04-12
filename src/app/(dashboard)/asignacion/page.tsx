'use client';

import ComboBox from '@/components/ui/ComboBox';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import { Trash } from 'lucide-react';
import React, { useMemo } from 'react';
import { create } from 'zustand';

interface AsignacionPageProps {}

const comboBoxOpens = create<{
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

const selectedData = create<{
  modelos: RouterOutputs['modelo']['getAll'];
  etiquetas: RouterOutputs['etiqueta']['getAll'];
  grupo: RouterOutputs['grupoEtiqueta']['getAll'][number] | undefined;
  setModelos: (modelos: RouterOutputs['modelo']['getAll'][number]) => void;
  setEtiquetas: (
    etiquetas: RouterOutputs['etiqueta']['getAll'][number]
  ) => void;
  setGrupo: (grupo: RouterOutputs['grupoEtiqueta']['getAll'][number]) => void;
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
}));

const AsignacionPage = ({}: AsignacionPageProps) => {
  const { data: modelos, isLoading: modelosLoading } =
    trpc.modelo.getAll.useQuery();
  const { data: grupoEtiquetasData, isLoading: grupoEtiquetaLoading } =
    trpc.grupoEtiqueta.getAll.useQuery();
  const { data: etiquetasData, isLoading: etiquetasLoading } =
    trpc.etiqueta.getAll.useQuery();

  const asignar = trpc.etiqueta.setMasivo.useMutation();

  const {
    etiquetas: etiquetasList,
    setEtiquetas,
    modelos: modelosList,
    setModelos,
    grupo: currentGrupo,
    setGrupo: setCurrentGrupo,
  } = selectedData();

  const {
    modelos: modelosOpen,
    setModelosOpen,
    grupos: gruposOpen,
    setGruposOpen,
    etiquetas: etiquetasOpen,
    setEtiquetasOpen,
  } = comboBoxOpens();

  async function asignarEtiquetas() {
    const etiquetaIds = etiquetasList.map((e) => e.id);
    const modeloIds = modelosList.map((m) => m.id);
    await asignar.mutateAsync({
      etiquetaIds,
      modeloIds,
    });
  }

  const modelosParaElegir = useMemo(() => {
    return modelos?.filter(
      (modelo) => !modelosList.find((m) => m.id === modelo.id)
    );
  }, [modelos, modelosList]);

  const etiquetasParaElegir = useMemo(() => {
    if (!currentGrupo) return etiquetasData;
    return etiquetasData?.filter(
      (etiqueta) =>
        etiqueta.grupoId === currentGrupo.id &&
        !etiquetasList.find((e) => e.id === etiqueta.id)
    );
  }, [currentGrupo, etiquetasData, etiquetasList]);

  return (
    <>
      <div className='flex h-full p-2'>
        <div className='flex-1'>
          <ComboBox
            open={modelosOpen}
            setOpen={setModelosOpen}
            isLoading={modelosLoading}
            triggerChildren={<p>Modelos</p>}
            notFoundText='No hay modelos disponibles'
            placeholder='Buscar modelos...'
            data={modelosParaElegir ?? []}
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

          {modelosList.map((modelo) => (
            <div className='flex w-3/4 justify-between p-1' key={modelo.id}>
              <p>{modelo.nombreCompleto}</p>
              <Trash
                className='cursor-pointer text-red-500'
                onClick={() => setModelos(modelo)}
              />
            </div>
          ))}
        </div>
        <div className='flex-1'>
          <div className='flex gap-x-4'>
            <ComboBox
              open={gruposOpen}
              setOpen={setGruposOpen}
              isLoading={grupoEtiquetaLoading}
              triggerChildren={<p>{currentGrupo?.nombre ?? 'Grupos'}</p>}
              notFoundText='No hay grupos disponibles'
              placeholder='Buscar grupos...'
              data={grupoEtiquetasData ?? []}
              id='id'
              value='nombre'
              onSelect={(value) => {
                setCurrentGrupo(
                  grupoEtiquetasData!.find(
                    (g) => g.id === value
                  ) as RouterOutputs['grupoEtiqueta']['getAll'][number]
                );
                setGruposOpen(false);
              }}
              selectedIf={currentGrupo?.id ?? ''}
            />
            <ComboBox
              data={etiquetasParaElegir ?? []}
              id='id'
              open={etiquetasOpen}
              setOpen={setEtiquetasOpen}
              onSelect={(value) => {
                setEtiquetas(
                  etiquetasData!.find(
                    (e) => e.id === value
                  ) as RouterOutputs['etiqueta']['getAll'][number]
                );
                setEtiquetasOpen(false);
              }}
              selectedIf=''
              value='nombre'
              triggerChildren={<p>Etiquetas</p>}
              isLoading={etiquetasLoading}
              notFoundText='No hay etiquetas disponibles'
              placeholder='Buscar etiquetas...'
            />
          </div>

          {etiquetasList.map((etiqueta) => (
            <div className='flex w-3/4 justify-between p-1' key={etiqueta.id}>
              <p>{etiqueta.nombre}</p>
              <Trash
                className='cursor-pointer text-red-500'
                onClick={() => setEtiquetas(etiqueta)}
              />
            </div>
          ))}
        </div>
      </div>
      <Button onClick={asignarEtiquetas}>Asignar</Button>
    </>
  );
};

export default AsignacionPage;
