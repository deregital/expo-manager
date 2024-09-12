import EtiquetaFillIcon from '@/components/icons/EtiquetaFillIcon';
import EtiquetasFillIcon from '@/components/icons/EtiquetasFillIcon';
import ComboBox from '@/components/ui/ComboBox';
import { useFiltro } from '@/components/ui/filtro/Filtro';
import { RouterOutputs } from '@/server';
import React, { useMemo, useState } from 'react';

type FiltroBasicoEtiquetaProps = {
  editarEtiq: (etiq: string) => void;
  editarGrupoEtiq: (grupoEtiq: string) => void;
  dataGrupos: RouterOutputs['grupoEtiqueta']['getAll'] | undefined;
  isLoadingGrupos: boolean;
  grupoEtiqueta: string | undefined;
  etiquetaId: string | undefined;
  dataEtiquetas:
    | RouterOutputs['etiqueta']['getAll']
    | RouterOutputs['etiqueta']['getByGrupoEtiqueta']
    | undefined;
  isLoadingEtiquetas: boolean;
};

const FiltroBasicoEtiqueta = ({
  editarEtiq,
  editarGrupoEtiq,
  dataGrupos,
  isLoadingGrupos,
  grupoEtiqueta,
  dataEtiquetas,
  isLoadingEtiquetas,
}: FiltroBasicoEtiquetaProps) => {
  const [openGrupo, setOpenGrupo] = useState(false);
  const [openEtiqueta, setOpenEtiqueta] = useState(false);

  const { etiquetas, grupos } = useFiltro();

  const etiquetaId = useMemo(() => {
    return etiquetas.length > 0 ? etiquetas[0].etiqueta.id : undefined;
  }, [etiquetas]);

  return (
    <div className='flex w-full flex-col items-center gap-4 md:flex-row'>
      <ComboBox
        data={dataGrupos ?? []}
        id='id'
        value='nombre'
        onSelect={(value) => {
          setOpenGrupo(false);
          editarGrupoEtiq(value);
        }}
        open={openGrupo}
        isLoading={isLoadingGrupos}
        setOpen={setOpenGrupo}
        wFullMobile
        selectedIf={grupos.length > 0 ? grupos[0].grupo.id : ''}
        triggerChildren={
          <>
            <span className='truncate'>
              {grupoEtiqueta
                ? (dataGrupos?.find((grupo) => grupo.id === grupoEtiqueta)
                    ?.nombre ?? 'Buscar grupo...')
                : 'Buscar grupo...'}
            </span>
            <EtiquetasFillIcon className='h-5 w-5' />
          </>
        }
      />
      <ComboBox
        data={dataEtiquetas ?? []}
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
        selectedIf={etiquetas.length > 0 ? etiquetas[0].etiqueta.id : ''}
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
