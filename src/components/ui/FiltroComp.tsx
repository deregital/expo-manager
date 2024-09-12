'use client';
import { useEffect, useMemo, useState } from 'react';
import ComboBox from './ComboBox';
import { Input } from './input';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import EtiquetaFillIcon from '../icons/EtiquetaFillIcon';
import EtiquetasFillIcon from '../icons/EtiquetasFillIcon';
import { XIcon } from 'lucide-react';
import { Filtro, FuncionFiltrar, defaultFilter } from '@/lib/filter';
import { cn } from '@/lib/utils';
import ModalFiltro from './ModalFiltro';
import { create } from 'zustand';

// Crear variable de zustand
export const useFiltro = create<Filtro>(() => defaultFilter);
export const useOpenModal = create<{ isOpen: boolean; toggle: () => void }>(
  (set) => ({
    isOpen: false,
    toggle: () => {
      set((state) => ({ isOpen: !state.isOpen }));
    },
  })
);
const FiltroComp = ({
  funcionFiltrado,
  className,
  mostrarEtiq = false,
  mostrarInput = false,
}: {
  funcionFiltrado: FuncionFiltrar;
  mostrarEtiq?: boolean;
  mostrarInput?: boolean;
  className?: string;
}) => {
  const filtro = useFiltro();
  const [grupoEtiqueta, setGrupoEtiqueta] = useState<string | undefined>(
    undefined
  );

  const [etiquetaId, setEtiquetaId] = useState<string | undefined>(undefined);
  const { data: dataGrupoEtiquetas, isLoading: isLoadingGrupo } =
    trpc.grupoEtiqueta.getAll.useQuery();

  const { data: dataEtiquetas, isLoading: isLoadingEtiquetas } = grupoEtiqueta
    ? trpc.etiqueta.getByGrupoEtiqueta.useQuery(grupoEtiqueta)
    : trpc.etiqueta.getAll.useQuery();

  // const [modalOpen, setModalOpen] = useState(false);

  function editarEtiq(etiqId: string) {
    const etiquetaSeleccionada = dataEtiquetas?.find((et) => et.id === etiqId)!;

    if (etiquetaId === etiqId) {
      useFiltro.setState({ etiquetas: [] });
      setEtiquetaId(undefined);
      return;
    }
    setEtiquetaId(etiqId);
    useFiltro.setState({
      ...filtro,
      etiquetas: [
        {
          etiqueta: {
            id: etiquetaSeleccionada.id,
            nombre: etiquetaSeleccionada.nombre,
          },
          include: true,
        },
      ],
    });
    return;
  }

  function editarGrupoEtiq(grupoEtiq: string) {
    if (grupoEtiqueta === grupoEtiq) {
      useFiltro.setState({ grupos: [] });
      setGrupoEtiqueta(undefined);
      return;
    }
    const grupo = dataGrupoEtiquetas?.find((grupo) => grupo.id === grupoEtiq);
    if (!grupo) return;

    useFiltro.setState({
      ...filtro,
      grupos: [
        {
          grupo: {
            id: grupo.id,
            nombre: grupo.nombre,
            color: grupo.color,
          },
          include: true,
        },
      ],
    });
    setGrupoEtiqueta(grupoEtiq);
  }

  function editarInput(input: string) {
    useFiltro.setState({ input });
  }

  function resetFilters() {
    useFiltro.setState(defaultFilter);
    setGrupoEtiqueta(undefined);
    setEtiquetaId(undefined);
  }

  useEffect(() => {
    const filtrar = () => {
      funcionFiltrado(filtro);
    };
    filtrar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  return (
    <div className='block'>
      <div className='w-full p-3'>
        {/* <Button onClick={toggle}>Buscador avanzado</Button> */}
        <ModalFiltro />
      </div>
      <div
        className={cn(
          'flex w-full flex-col items-center justify-between gap-4 p-3 md:flex-row',
          className
        )}
      >
        {mostrarEtiq && (
          <CompEtiq
            editarEtiq={editarEtiq}
            editarGrupoEtiq={editarGrupoEtiq}
            dataGrupos={dataGrupoEtiquetas}
            isLoadingGrupos={isLoadingGrupo}
            grupoEtiqueta={grupoEtiqueta}
            etiquetaId={etiquetaId}
            dataEtiquetas={dataEtiquetas}
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
    </div>
  );
};

const CompEtiq = ({
  editarEtiq,
  editarGrupoEtiq,
  dataGrupos,
  isLoadingGrupos,
  grupoEtiqueta,
  dataEtiquetas,
  isLoadingEtiquetas,
}: {
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
}) => {
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
