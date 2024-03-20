import EtiquetaFillIcon from '@/components/icons/EtiquetaFillIcon';
import EtiquetasFillIcon from '@/components/icons/EtiquetasFillIcon';
import { useModeloData } from '@/components/modelo/ModeloPageContent';
import ComboBox from '@/components/ui/ComboBox';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { getTextColorByBg } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import React, { useMemo, useState } from 'react';

function availableGrupos(
  etiquetas: NonNullable<RouterOutputs['modelo']['getById']>['etiquetas'],
  gruposData: NonNullable<RouterOutputs['grupoEtiqueta']['getAll']>
) {
  // return all grupos that have esExclusivo false and the ones that have esExclusivo true and not have etiquetas
  return gruposData.filter((grupo) => {
    if (grupo.etiquetas.length === 0) return false;
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
    if (!grupos.map((g) => g.id).includes(etiqueta.grupo.id)) return false;
    return !etiquetas.map((etiqueta) => etiqueta.id).includes(etiqueta.id);
  });
}

interface AddEtiquetaCombosProps {
  closeAddEtiqueta: () => void;
  openAddEtiqueta: () => void;
}

const AddEtiquetaCombos = ({
  closeAddEtiqueta,
  openAddEtiqueta,
}: AddEtiquetaCombosProps) => {
  const [{ grupoId, etiquetaId }, setGrupoYEtiquetas] = useState({
    grupoId: '',
    etiquetaId: '',
  });

  const addEtiqueta = trpc.modelo.edit.useMutation();

  const { etiquetas, modeloId } = useModeloData((state) => ({
    etiquetas: state.etiquetas,
    modeloId: state.id,
  }));

  const [openGrupo, setOpenGrupo] = useState(false);
  const [openEtiqueta, setOpenEtiqueta] = useState(false);

  const { data: gruposData } = trpc.grupoEtiqueta.getAll.useQuery();

  const { data: etiquetasData } =
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

  async function handleAddEtiqueta() {
    if (etiquetaId === '') return;
    const addedEtiqueta = etiquetasData?.find(
      (etiqueta) => etiqueta.id === etiquetaId
    );
    if (!addedEtiqueta) return;

    useModeloData.setState({
      etiquetas: [
        ...etiquetas,
        {
          id: etiquetaId,
          nombre: addedEtiqueta.nombre,
          grupo: addedEtiqueta.grupo,
          grupoId: addedEtiqueta.grupo.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    });

    closeAddEtiqueta();

    await addEtiqueta
      .mutateAsync({
        id: modeloId,
        etiquetas: [
          ...etiquetas.map((e) => ({
            id: e.id,
            nombre: e.nombre,
            grupo: {
              id: e.grupo.id,
              esExclusivo: e.grupo.esExclusivo,
            },
          })),
          {
            id: addedEtiqueta.id,
            nombre: addedEtiqueta.nombre,
            grupo: {
              id: addedEtiqueta.grupo.id,
              esExclusivo: addedEtiqueta.grupo.esExclusivo,
            },
          },
        ],
      })
      .catch(() => {
        useModeloData.setState({
          etiquetas: etiquetas.filter((e) => e.id !== etiquetaId),
        });
        openAddEtiqueta();
      });
  }

  return (
    <div className='mt-2 flex flex-col gap-2 md:flex-row'>
      <ComboBox
        open={openGrupo}
        setOpen={setOpenGrupo}
        data={availableGruposData ?? []}
        id='id'
        buttonStyle={{
          backgroundColor: currentGrupo?.color,
          color: getTextColorByBg(currentGrupo?.color ?? '#ffffff'),
        }}
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
      <Button onClick={handleAddEtiqueta}>Agregar</Button>
    </div>
  );
};

export default AddEtiquetaCombos;