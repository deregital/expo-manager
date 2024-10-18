import {
  asignacionComboBoxOpens,
  asignacionSelectedData,
} from '@/components/etiquetas/asignacion/ModelosComboYList';
import ComboBox from '@/components/ui/ComboBox';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import { TipoEtiqueta } from '@prisma/client';
import { Trash } from 'lucide-react';
import React, { useMemo } from 'react';

interface EtiquetasComboYListProps {}

const EtiquetasComboYList = ({}: EtiquetasComboYListProps) => {
  const { data: tagGroupsData, isLoading: tagGroupLoading } =
    trpc.tagGroup.getAll.useQuery();
  const { data: etiquetasData, isLoading: etiquetasLoading } =
    trpc.etiqueta.getAll.useQuery();

  const {
    etiquetas: etiquetasList,
    setEtiquetas,
    group: currentGroup,
    setGroup: setCurrentGroup,
  } = asignacionSelectedData();

  const {
    groups: openGroups,
    setGroupsOpen: setOpenGroups,
    etiquetas: etiquetasOpen,
    setEtiquetasOpen,
  } = asignacionComboBoxOpens();

  const etiquetasParaElegir = useMemo(() => {
    const etPosibles = etiquetasData?.filter((et) => {
      if (et.tipo !== TipoEtiqueta.PERSONAL) return false;
      if (!currentGroup)
        return !etiquetasList.find(
          (e) =>
            e.id === et.id || (et.grupo.esExclusivo && e.grupoId === et.grupoId)
        );

      return et.grupoId === currentGroup.id;
    });

    if (!currentGroup) {
      return etPosibles?.filter(
        (et) => !etiquetasList.find((e) => e.id === et.id)
      );
    }

    return etPosibles?.filter(
      (etiqueta) =>
        etiqueta.grupoId === currentGroup.id &&
        !etiquetasList.some(
          (e) => e.grupoId === etiqueta.grupoId && etiqueta.grupo.esExclusivo
        ) &&
        !etiquetasList.find((e) => e.id === etiqueta.id)
    );
  }, [currentGroup, etiquetasData, etiquetasList]);

  const choosableGroups = useMemo(() => {
    return tagGroupsData?.filter((g) =>
      g.tags.some((tag) => tag.type === 'PARTICIPANT')
    );
  }, [tagGroupsData]);

  return (
    <>
      <div className='flex flex-col gap-4 sm:flex-row'>
        <ComboBox
          open={openGroups}
          setOpen={setOpenGroups}
          isLoading={tagGroupLoading}
          triggerChildren={<p>{currentGroup?.name ?? 'Grupos'}</p>}
          notFoundText='No hay grupos disponibles'
          placeholder='Buscar grupos...'
          data={choosableGroups ?? []}
          id='id'
          value='name'
          wFullMobile
          onSelect={(value) => {
            setCurrentGroup(
              tagGroupsData!.find(
                (group) => group.id === value
              ) as RouterOutputs['tagGroup']['getAll'][number]
            );
            setOpenGroups(false);
          }}
          selectedIf={currentGroup?.id ?? ''}
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
