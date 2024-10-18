import EtiquetaFillIcon from '@/components/icons/EtiquetaFillIcon';
import EtiquetasFillIcon from '@/components/icons/EtiquetasFillIcon';
import ComboBox from '@/components/ui/ComboBox';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import { EtiquetaBaseConGrupoColor } from '@/server/types/etiquetas';
import { TipoEtiqueta } from '@prisma/client';
import { type TagType } from 'expo-backend-types';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

function availableGroups(
  etiquetas: EtiquetaBaseConGrupoColor[],
  groupsdata: NonNullable<RouterOutputs['tagGroup']['getAll']>
) {
  const internalTagTypes: TagType[] = ['PARTICIPANT', 'NOT_IN_SYSTEM'];

  return groupsdata.filter((group) => {
    if (group.tags.length === 0) return false;
    if (group.tags.every((tag) => internalTagTypes.includes(tag.type))) {
      return false;
    }
    if (group.isExclusive) {
      const etiquetasIds = etiquetas.map((etiqueta) => etiqueta.grupo.id);
      return !etiquetasIds.includes(group.id);
    } else {
      if (
        group.tags.length ===
        etiquetas.filter((etiqueta) => etiqueta.grupo.id === group.id).length
      )
        return false;
    }
    return true;
  });
}

function availableEtiquetas(
  etiquetas: EtiquetaBaseConGrupoColor[],
  etiquetasData: NonNullable<RouterOutputs['etiqueta']['getAll']>,
  groups: ReturnType<typeof availableGroups>
) {
  return etiquetasData.filter((etiqueta) => {
    if (
      etiqueta.tipo === TipoEtiqueta.MODELO ||
      etiqueta.tipo === TipoEtiqueta.TENTATIVA
    )
      return false;
    if (!groups.map((g) => g.id).includes(etiqueta.grupo.id)) return false;
    return !etiquetas.map((etiqueta) => etiqueta.id).includes(etiqueta.id);
  });
}

interface AddEtiquetaCombosProps {
  etiquetas: EtiquetaBaseConGrupoColor[];
  handleAddEtiqueta: (
    addedEtiqueta: NonNullable<
      RouterOutputs['modelo']['getById']
    >['etiquetas'][number]
  ) => void;
}

const AddEtiquetaCombos = ({
  etiquetas,
  handleAddEtiqueta,
}: AddEtiquetaCombosProps) => {
  const [{ groupId, etiquetaId }, setTagAndGroup] = useState({
    groupId: '',
    etiquetaId: '',
  });
  const [groupOpen, setGroupOpen] = useState(false);
  const [openEtiqueta, setOpenEtiqueta] = useState(false);

  const { data: tagGroupsData } = trpc.tagGroup.getAll.useQuery();
  const { data: etiquetasData, isLoading: isLoadingEtiquetas } =
    groupId === ''
      ? trpc.etiqueta.getAll.useQuery()
      : trpc.etiqueta.getByGrupoEtiqueta.useQuery(groupId);

  const currentGroup = useMemo(() => {
    return tagGroupsData?.find((group) => group.id === groupId);
  }, [groupId, tagGroupsData]);

  const availableGroupsData = useMemo(
    () => availableGroups(etiquetas, tagGroupsData ?? []),
    [etiquetas, tagGroupsData]
  );

  const availableEtiquetasData = useMemo(
    () =>
      availableEtiquetas(etiquetas, etiquetasData ?? [], availableGroupsData),
    [etiquetas, etiquetasData, availableGroupsData]
  );

  const selectedEtiqueta = useMemo(() => {
    return etiquetasData?.find((etiqueta) => etiqueta.id === etiquetaId);
  }, [etiquetaId, etiquetasData]);

  return (
    <div className='mt-2 flex flex-col gap-2 md:flex-row'>
      <ComboBox
        open={groupOpen}
        setOpen={setGroupOpen}
        data={availableGroupsData ?? []}
        id='id'
        wFullMobile
        triggerChildren={
          <>
            <span className='max-w-[calc(100%-30px)] truncate'>
              {groupId ? currentGroup?.name : 'Buscar grupo...'}
            </span>
            <EtiquetasFillIcon className='h-5 w-5' />
          </>
        }
        value='name'
        onSelect={(value) => {
          if (value === groupId) {
            setTagAndGroup({
              groupId: '',
              etiquetaId: etiquetaId,
            });
          } else {
            setTagAndGroup({
              groupId: value,
              etiquetaId: etiquetaId,
            });
          }
          setGroupOpen(false);
        }}
        enabled={availableGroupsData.map((group) => group.id)}
        selectedIf={groupId}
      />
      <ComboBox
        open={openEtiqueta}
        setOpen={setOpenEtiqueta}
        data={availableEtiquetasData ?? []}
        id='id'
        value='nombre'
        onSelect={(value) => {
          setTagAndGroup({
            groupId: groupId,
            etiquetaId: value,
          });
          setOpenEtiqueta(false);
        }}
        wFullMobile
        isLoading={isLoadingEtiquetas}
        selectedIf={etiquetaId}
        triggerChildren={
          <>
            <span className='truncate'>
              {etiquetaId !== ''
                ? (etiquetasData?.find((etiqueta) => etiqueta.id === etiquetaId)
                    ?.nombre ?? 'Buscar etiqueta...')
                : 'Buscar etiqueta...'}
            </span>
            <EtiquetaFillIcon className='h-5 w-5' />
          </>
        }
      />
      <Button
        onClick={() => {
          if (selectedEtiqueta) {
            handleAddEtiqueta(selectedEtiqueta);
          } else {
            toast.error('Selecciona una etiqueta');
          }
        }}
      >
        Agregar
      </Button>
    </div>
  );
};

export default AddEtiquetaCombos;
