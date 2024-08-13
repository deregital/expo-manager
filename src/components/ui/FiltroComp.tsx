'use client';
import { useEffect, useState } from 'react';
import ComboBox from './ComboBox';
import { Input } from './input';
import { Perfil } from '@prisma/client';
import { EtiquetaGrupo, Etiqueta } from '@prisma/client';
import { trpc } from '@/lib/trpc';

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
      <div className='flex items-center justify-center gap-x-4'>
        {mostrarEtiq && (
          <CompEtiq
            editarEtiq={editarEtiq}
            dataGrupos={GrupoEtiquetas}
            setGrupoEtiqueta={setGrupoEtiqueta}
            dataEtiquetas={etiquetas}
          />
        )}
        {mostrarInput && <CompInput editarInput={editarInput} />}
      </div>
      <Input placeholder='Buscar' value={''} onChange={() => {}} />
    </div>
  );
};
const CompEtiq = ({
  editarEtiq,
  dataGrupos,
  setGrupoEtiqueta,
  dataEtiquetas,
}: {
  editarEtiq: (etiq: string) => void;
  dataGrupos: EtiquetaGrupo;
  setGrupoEtiqueta: (grupo: string) => void;
  dataEtiquetas: Etiqueta[];
}) => {
  return (
    <>
      <ComboBox
        data={dataGrupos}
        id='id'
        value='nombre'
        onSelect={(value) => {
          setGrupoEtiqueta(value);
        }}
        open={}
        setOpen={}
        selectedIf={}
        triggerChildren={}
      />
    </>
  );
};

const CompInput = ({
  editarInput,
}: {
  editarInput: (input: string) => void;
}) => {
  return <Input placeholder='Buscar' value={''} onChange={() => {}} />;
};
export default FiltroComp;
