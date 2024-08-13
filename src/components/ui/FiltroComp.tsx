'use client';
import { useEffect, useState } from 'react';
import ComboBox from './ComboBox';
import { Input } from './input';
import { Perfil } from '@prisma/client';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import EtiquetaFillIcon from '../icons/EtiquetaFillIcon';
import EtiquetasFillIcon from '../icons/EtiquetasFillIcon';

type Filtrar = ({
  input,
  etiquetasId,
}: {
  input: string | undefined;
  etiquetasId: string | undefined;
}) => Perfil[];
const FiltroComp = ({
  mostrarEtiq,
  mostrarInput,
  funcionFiltrado,
}: {
  mostrarEtiq: boolean;
  mostrarInput: boolean;
  funcionFiltrado: Filtrar;
}) => {
  const [filtro, setFiltro] = useState<{
    input: string;
    etiquetasId: string | undefined;
  }>({ input: '', etiquetasId: undefined });
  const [grupoEtiqueta, setGrupoEtiqueta] = useState<string | undefined>(
    undefined
  );
  const { data: GrupoEtiquetas } = trpc.grupoEtiqueta.getAll.useQuery();
  const { data: etiquetas } = grupoEtiqueta
    ? trpc.etiqueta.getByGrupoEtiqueta.useQuery(grupoEtiqueta)
    : trpc.etiqueta.getAll.useQuery();
  const editarEtiq = (etiq: string) => {
    if (filtro.etiquetasId === etiq) {
      setFiltro({ ...filtro, etiquetasId: undefined });
      return;
    }
    setFiltro({ ...filtro, etiquetasId: etiq });
  };

  const editarInput = (input: string) => {
    setFiltro({ ...filtro, input: input });
  };

  useEffect(() => {
    const filtrar = () => {
      funcionFiltrado(filtro);
    };
    filtrar();
  }, [filtro]);
  return (
    <div className='fles items-center justify-between'>
      {mostrarEtiq && (
        <CompEtiq
          editarEtiq={editarEtiq}
          dataGrupos={GrupoEtiquetas}
          grupoEtiqueta={grupoEtiqueta}
          setGrupoEtiqueta={setGrupoEtiqueta}
          dataEtiquetas={etiquetas}
        />
      )}
      {mostrarInput && (
        <CompInput editarInput={editarInput} inputFiltro={filtro.input} />
      )}
    </div>
  );
};
const CompEtiq = ({
  editarEtiq,
  dataGrupos,
  grupoEtiqueta,
  setGrupoEtiqueta,
  dataEtiquetas,
}: {
  editarEtiq: (etiq: string) => void;
  dataGrupos: RouterOutputs['grupoEtiqueta']['getAll'] | undefined;
  grupoEtiqueta: string | undefined;
  setGrupoEtiqueta: (grupo: string) => void;
  dataEtiquetas:
    | RouterOutputs['etiqueta']['getAll']
    | RouterOutputs['etiqueta']['getByGrupoEtiqueta']
    | undefined;
}) => {
  const [openGrupo, setOpenGrupo] = useState(false);
  const [openEtiqueta, setOpenEtiqueta] = useState(false);
  const [etiquetaId, setEtiquetaId] = useState<string | undefined>(undefined);
  return (
    <div className='flex items-center justify-center gap-x-4'>
      <ComboBox
        data={dataGrupos ?? []}
        id='id'
        value='nombre'
        onSelect={(value) => {
          setGrupoEtiqueta(value);
        }}
        open={openGrupo}
        setOpen={setOpenGrupo}
        selectedIf={grupoEtiqueta !== undefined ? grupoEtiqueta : ''}
        triggerChildren={
          <>
            <span className='truncate'>
              {grupoEtiqueta
                ? dataGrupos?.find((grupo) => grupo.id === grupoEtiqueta)
                    ?.nombre ?? 'Buscar grupo...'
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
          setEtiquetaId(value);
          editarEtiq(value);
        }}
        open={openEtiqueta}
        setOpen={setOpenEtiqueta}
        selectedIf={etiquetaId !== undefined ? etiquetaId : ''}
        triggerChildren={
          <>
            <span className='truncate'>
              {etiquetaId
                ? dataEtiquetas?.find((etiqueta) => etiqueta.id === etiquetaId)
                    ?.nombre ?? 'Buscar etiqueta...'
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
    />
  );
};
export default FiltroComp;
