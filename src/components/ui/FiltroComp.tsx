'use client';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import ComboBox from './ComboBox';
import { Input } from './input';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import EtiquetaFillIcon from '../icons/EtiquetaFillIcon';
import EtiquetasFillIcon from '../icons/EtiquetasFillIcon';
import { XIcon } from 'lucide-react';

type Filtrar = ({
  input,
  etiquetasId,
  grupoId,
}: {
  input: string;
  etiquetasId: string | undefined;
  grupoId: string | undefined;
}) => void;

const FiltroComp = ({
  funcionFiltrado,
  mostrarEtiq = false,
  mostrarInput = false,
}: {
  funcionFiltrado: Filtrar;
  mostrarEtiq?: boolean;
  mostrarInput?: boolean;
}) => {
  const [filtro, setFiltro] = useState<{
    input: string;
    etiquetasId: string | undefined;
    grupoId: string | undefined;
  }>({ input: '', etiquetasId: undefined, grupoId: undefined });
  const [grupoEtiqueta, setGrupoEtiqueta] = useState<string | undefined>(
    undefined
  );
  const [etiquetaId, setEtiquetaId] = useState<string | undefined>(undefined);
  const { data: GrupoEtiquetas, isLoading: isLoadingGrupo } =
    trpc.grupoEtiqueta.getAll.useQuery();
  const { data: etiquetas, isLoading: isLoadingEtiquetas } = grupoEtiqueta
    ? trpc.etiqueta.getByGrupoEtiqueta.useQuery(grupoEtiqueta)
    : trpc.etiqueta.getAll.useQuery();
  const editarEtiq = (etiq: string) => {
    if (filtro.etiquetasId === etiq) {
      setFiltro({ ...filtro, etiquetasId: undefined });
      setEtiquetaId(undefined);
      return;
    }
    setFiltro({ ...filtro, etiquetasId: etiq });
    setEtiquetaId(etiq);
  };
  const editarGrupoEtiq = (grupoEtiq: string) => {
    if (filtro.grupoId === grupoEtiq) {
      setFiltro({ ...filtro, grupoId: undefined });
      setGrupoEtiqueta(undefined);
      return;
    }
    setFiltro({ ...filtro, grupoId: grupoEtiq });
    setGrupoEtiqueta(grupoEtiq);
  };
  const editarInput = (input: string) => {
    setFiltro({ ...filtro, input: input });
  };
  const resetFilters = () => {
    setFiltro({ input: '', etiquetasId: undefined, grupoId: undefined });
    setGrupoEtiqueta(undefined);
    setEtiquetaId(undefined);
  };
  useEffect(() => {
    const filtrar = () => {
      funcionFiltrado(filtro);
    };
    filtrar();
  }, [filtro]);
  return (
    <div className='flex w-full flex-col items-center justify-between gap-4 p-3 md:flex-row'>
      {mostrarEtiq && (
        <CompEtiq
          editarEtiq={editarEtiq}
          editarGrupoEtiq={editarGrupoEtiq}
          dataGrupos={GrupoEtiquetas}
          isLoadingGrupos={isLoadingGrupo}
          grupoEtiqueta={grupoEtiqueta}
          etiquetaId={etiquetaId}
          setGrupoEtiqueta={setGrupoEtiqueta}
          dataEtiquetas={etiquetas}
          isLoadingEtiquetas={isLoadingEtiquetas}
        />
      )}
      <div className='flex w-full items-center justify-end gap-x-2'>
        {mostrarInput && (
          <CompInput editarInput={editarInput} inputFiltro={filtro.input} />
        )}
        <XIcon className='h-4 w-4 cursor-pointer' onClick={resetFilters} />
      </div>
    </div>
  );
};
const CompEtiq = ({
  editarEtiq,
  editarGrupoEtiq,
  dataGrupos,
  isLoadingGrupos,
  grupoEtiqueta,
  etiquetaId,
  setGrupoEtiqueta,
  dataEtiquetas,
  isLoadingEtiquetas,
}: {
  editarEtiq: (etiq: string) => void;
  editarGrupoEtiq: (grupoEtiq: string) => void;
  dataGrupos: RouterOutputs['grupoEtiqueta']['getAll'] | undefined;
  isLoadingGrupos: boolean;
  grupoEtiqueta: string | undefined;
  etiquetaId: string | undefined;
  setGrupoEtiqueta: Dispatch<SetStateAction<string | undefined>>;
  dataEtiquetas:
    | RouterOutputs['etiqueta']['getAll']
    | RouterOutputs['etiqueta']['getByGrupoEtiqueta']
    | undefined;
  isLoadingEtiquetas: boolean;
}) => {
  const [openGrupo, setOpenGrupo] = useState(false);
  const [openEtiqueta, setOpenEtiqueta] = useState(false);
  return (
    <div className='flex w-full flex-col items-center gap-4 md:flex-row'>
      <ComboBox
        data={dataGrupos ?? []}
        id='id'
        value='nombre'
        onSelect={(value) => {
          setOpenGrupo(false);
          if (grupoEtiqueta === value) {
            editarGrupoEtiq('');
            return;
          }
          editarGrupoEtiq(value);
        }}
        open={openGrupo}
        isLoading={isLoadingGrupos}
        setOpen={setOpenGrupo}
        wFullMobile
        selectedIf={grupoEtiqueta !== undefined ? grupoEtiqueta : ''}
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
          if (etiquetaId === value) {
            editarEtiq('');
            return;
          }
          editarEtiq(value);
        }}
        open={openEtiqueta}
        wFullMobile
        isLoading={isLoadingEtiquetas}
        setOpen={setOpenEtiqueta}
        selectedIf={etiquetaId !== undefined ? etiquetaId : ''}
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

const CompInput = ({
  editarInput,
  inputFiltro,
}: {
  editarInput: (input: string) => void;
  inputFiltro: string;
}) => {
  return (
    <Input
      placeholder='Buscar'
      value={inputFiltro}
      onChange={(e) => {
        editarInput(e.target.value);
      }}
      className='w-full md:max-w-md'
    />
  );
};
export default FiltroComp;
