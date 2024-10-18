import EtiquetaFillIcon from '@/components/icons/EtiquetaFillIcon';
import EtiquetasFillIcon from '@/components/icons/EtiquetasFillIcon';
import ComboBox from '@/components/ui/ComboBox';
import { useFiltro } from '@/components/ui/filtro/Filtro';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/lib/trpc';
import React, { useState, useMemo } from 'react';

type FiltroBasicoEtiquetaProps = {
  editarEtiq: (etiq: string) => void;
  editTagGroup: (tagGroup: string) => void;
  groupId: string | undefined;
  etiquetaId: string | undefined;
  switchDisabled: boolean;
  include: boolean;
  setInclude: (value: boolean) => void;
};

const FiltroBasicoEtiqueta = ({
  editarEtiq,
  editTagGroup,
  groupId,
  etiquetaId,
  switchDisabled,
  include,
  setInclude,
}: FiltroBasicoEtiquetaProps) => {
  const { etiquetasFiltro } = useFiltro((s) => ({
    etiquetasFiltro: s.etiquetas,
  }));
  const [openGroup, setOpenGroup] = useState(false);
  const [openEtiqueta, setOpenEtiqueta] = useState(false);

  const { data: tagGroupsData, isLoading: isLoadingGroups } =
    trpc.tagGroup.getAll.useQuery();

  const { data: dataEtiquetas, isLoading: isLoadingEtiquetas } = groupId
    ? trpc.etiqueta.getByGrupoEtiqueta.useQuery(groupId)
    : trpc.etiqueta.getAll.useQuery();

  const etiquetasFiltradas = useMemo(() => {
    return dataEtiquetas?.filter((etiqueta) => {
      return !etiquetasFiltro.find(
        (etiquetaFiltro) => etiquetaFiltro.etiqueta.id === etiqueta.id
      );
    });
  }, [dataEtiquetas, etiquetasFiltro]);

  return (
    <div className='flex w-full flex-col items-center gap-4 md:w-fit md:flex-row'>
      <Switch
        className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 disabled:data-[state=checked]:bg-green-800 disabled:data-[state=unchecked]:bg-red-800'
        disabled={switchDisabled}
        checked={include}
        onCheckedChange={(e) => {
          setInclude(e);
        }}
      />
      <ComboBox
        data={tagGroupsData ?? []}
        id='id'
        value='name'
        onSelect={(value) => {
          setOpenGroup(false);
          editTagGroup(value);
        }}
        open={openGroup}
        isLoading={isLoadingGroups}
        setOpen={setOpenGroup}
        wFullMobile
        selectedIf={groupId ?? ''}
        triggerChildren={
          <>
            <span className='truncate'>
              {groupId
                ? (tagGroupsData?.find((group) => group.id === groupId)?.name ??
                  'Buscar grupo...')
                : 'Buscar grupo...'}
            </span>
            <EtiquetasFillIcon className='h-5 w-5' />
          </>
        }
      />
      <ComboBox
        data={dataEtiquetas ?? []}
        filteredData={etiquetasFiltradas}
        id='id'
        value='nombre'
        onSelect={(value) => {
          setOpenEtiqueta(false);
          editarEtiq(value);
        }}
        open={openEtiqueta}
        wFullMobile
        isLoading={isLoadingEtiquetas}
        setOpen={setOpenEtiqueta}
        selectedIf={etiquetaId ?? ''}
        triggerChildren={
          <>
            <span className='truncate'>
              {etiquetaId
                ? (dataEtiquetas?.find((etiqueta) => etiqueta.id === etiquetaId)
                    ?.nombre ?? 'Buscar etiqueta...')
                : 'Buscar etiqueta...'}
            </span>
            <EtiquetaFillIcon className='h-5 w-5' />
          </>
        }
      />
    </div>
  );
};

export default FiltroBasicoEtiqueta;
