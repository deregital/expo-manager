import {
  asignacionComboBoxOpens,
  asignacionSelectedData,
} from '@/components/etiquetas/asignacion/ModelosComboYList';
import ComboBox from '@/components/ui/ComboBox';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import { Trash } from 'lucide-react';
import React, { useMemo } from 'react';

interface EtiquetasComboYListProps {}

const EtiquetasComboYList = ({}: EtiquetasComboYListProps) => {
  const { data: grupoEtiquetasData, isLoading: grupoEtiquetaLoading } =
    trpc.grupoEtiqueta.getAll.useQuery();
  const { data: etiquetasData, isLoading: etiquetasLoading } =
    trpc.etiqueta.getAll.useQuery();

  const {
    etiquetas: etiquetasList,
    setEtiquetas,
    grupo: currentGrupo,
    setGrupo: setCurrentGrupo,
  } = asignacionSelectedData();

  const {
    grupos: gruposOpen,
    setGruposOpen,
    etiquetas: etiquetasOpen,
    setEtiquetasOpen,
  } = asignacionComboBoxOpens();

  const etiquetasParaElegir = useMemo(() => {
    const etPosibles = etiquetasData?.filter((et) => {
      if (!currentGrupo)
        return !etiquetasList.find(
          (e) =>
            e.id === et.id || (et.grupo.esExclusivo && e.grupoId === et.grupoId)
        );

      return et.grupoId === currentGrupo.id;
    });

    if (!currentGrupo) {
      return etPosibles?.filter(
        (et) => !etiquetasList.find((e) => e.id === et.id)
      );
    }

    return etPosibles?.filter(
      (etiqueta) =>
        etiqueta.grupoId === currentGrupo.id &&
        !etiquetasList.some(
          (e) => e.grupoId === etiqueta.grupoId && etiqueta.grupo.esExclusivo
        ) &&
        !etiquetasList.find((e) => e.id === etiqueta.id)
    );
  }, [currentGrupo, etiquetasData, etiquetasList]);

  return (
    <>
      <div className='flex flex-col gap-4 sm:flex-row'>
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
          wFullMobile
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
          wFullMobile
          value='nombre'
          triggerChildren={<p>Etiquetas</p>}
          isLoading={etiquetasLoading}
          notFoundText='No hay etiquetas disponibles'
          placeholder='Buscar etiquetas...'
        />
      </div>
      <div
        className={cn(
          etiquetasList.length > 0 && 'mt-2 rounded-md border border-gray-500'
        )}
      >
        {etiquetasList.map((etiqueta) => (
          <div
            className='flex w-full justify-between p-1'
            style={{ backgroundColor: `${etiqueta.grupo.color}80` }}
            key={etiqueta.id}
          >
            <p>{etiqueta.nombre}</p>
            <Trash
              className='cursor-pointer fill-red-500 text-red-900'
              onClick={() => setEtiquetas(etiqueta)}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default EtiquetasComboYList;
