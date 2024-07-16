import EtiquetaFillIcon from '@/components/icons/EtiquetaFillIcon';
import EtiquetasFillIcon from '@/components/icons/EtiquetasFillIcon';
import ComboBox from '@/components/ui/ComboBox';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import { TipoEtiqueta } from '@prisma/client';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

function availableGrupos(
  etiquetas: NonNullable<RouterOutputs['modelo']['getById']>['etiquetas'],
  gruposData: NonNullable<RouterOutputs['grupoEtiqueta']['getAll']>
) {
  return gruposData.filter((grupo) => {
    if (grupo.etiquetas.length === 0) return false;
    if (
      grupo.etiquetas.every(
        (etiqueta) =>
          etiqueta.tipo === TipoEtiqueta.MODELO ||
          etiqueta.tipo === TipoEtiqueta.TENTATIVA
      )
    ) {
      return false;
    }
    if (grupo.esExclusivo) {
      const etiquetasIds = etiquetas.map((etiqueta) => etiqueta.grupo.id);
      return !etiquetasIds.includes(grupo.id);
    } else {
      if (
        grupo.etiquetas.length ===
        etiquetas.filter((etiqueta) => etiqueta.grupo.id === grupo.id).length
      )
        return false;
    }
    return true;
  });
}

function availableEtiquetas(
  etiquetas: NonNullable<RouterOutputs['modelo']['getById']>['etiquetas'],
  etiquetasData: NonNullable<RouterOutputs['etiqueta']['getAll']>,
  grupos: ReturnType<typeof availableGrupos>
) {
  return etiquetasData.filter((etiqueta) => {
    if (
      etiqueta.tipo === TipoEtiqueta.MODELO ||
      etiqueta.tipo === TipoEtiqueta.TENTATIVA
    )
      return false;
    if (!grupos.map((g) => g.id).includes(etiqueta.grupo.id)) return false;
    return !etiquetas.map((etiqueta) => etiqueta.id).includes(etiqueta.id);
  });
}

interface AddEtiquetaCombosProps {
  etiquetas: NonNullable<RouterOutputs['modelo']['getById']>['etiquetas'];
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
  const [{ grupoId, etiquetaId }, setGrupoYEtiquetas] = useState({
    grupoId: '',
    etiquetaId: '',
  });
  const [openGrupo, setOpenGrupo] = useState(false);
  const [openEtiqueta, setOpenEtiqueta] = useState(false);

  const { data: gruposData } = trpc.grupoEtiqueta.getAll.useQuery();
  const { data: etiquetasData, isLoading: isLoadingEtiquetas } =
    grupoId === ''
      ? trpc.etiqueta.getAll.useQuery()
      : trpc.etiqueta.getByGrupoEtiqueta.useQuery(grupoId);

  const currentGrupo = useMemo(() => {
    return gruposData?.find((grupo) => grupo.id === grupoId);
  }, [grupoId, gruposData]);

  const availableGruposData = useMemo(
    () => availableGrupos(etiquetas, gruposData ?? []),
    [etiquetas, gruposData]
  );

  const availableEtiquetasData = useMemo(
    () =>
      availableEtiquetas(etiquetas, etiquetasData ?? [], availableGruposData),
    [etiquetas, etiquetasData, availableGruposData]
  );

  const selectedEtiqueta = useMemo(() => {
    return etiquetasData?.find((etiqueta) => etiqueta.id === etiquetaId);
  }, [etiquetaId]);

  return (
    <div className='mt-2 flex flex-col gap-2 md:flex-row'>
      <ComboBox
        open={openGrupo}
        setOpen={setOpenGrupo}
        data={availableGruposData ?? []}
        id='id'
        wFullMobile
        triggerChildren={
          <>
            <span className='max-w-[calc(100%-30px)] truncate'>
              {grupoId ? currentGrupo?.nombre : 'Buscar grupo...'}
            </span>
            <EtiquetasFillIcon className='h-5 w-5' />
          </>
        }
        value='nombre'
        onSelect={(value) => {
          if (value === grupoId) {
            setGrupoYEtiquetas({
              grupoId: '',
              etiquetaId: etiquetaId,
            });
          } else {
            setGrupoYEtiquetas({
              grupoId: value,
              etiquetaId: etiquetaId,
            });
          }
          setOpenGrupo(false);
        }}
        enabled={availableGruposData.map((grupo) => grupo.id)}
        selectedIf={grupoId}
      />
      <ComboBox
        open={openEtiqueta}
        setOpen={setOpenEtiqueta}
        data={availableEtiquetasData ?? []}
        id='id'
        value='nombre'
        onSelect={(value) => {
          setGrupoYEtiquetas({
            grupoId: grupoId,
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
                ? etiquetasData?.find((etiqueta) => etiqueta.id === etiquetaId)
                    ?.nombre ?? 'Buscar etiqueta...'
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
