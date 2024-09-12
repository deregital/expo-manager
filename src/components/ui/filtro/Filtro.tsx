'use client';
import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { XIcon } from 'lucide-react';
import { Filtro, FuncionFiltrar, defaultFilter } from '@/lib/filter';
import { cn } from '@/lib/utils';
import ModalFiltro from '@/components/ui/filtro/ModalFiltro';
import { create } from 'zustand';
import FiltroBasicoEtiqueta from '@/components/ui/filtro/FiltroBasicoEtiqueta';
import FiltroBasicoInput from '@/components/ui/filtro/FiltroBasicoInput';

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
          <FiltroBasicoEtiqueta
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
            <FiltroBasicoInput
              editarInput={editarInput}
              inputFiltro={filtro.input}
            />
          )}
          <XIcon className='h-4 w-4 cursor-pointer' onClick={resetFilters} />
        </div>
      </div>
    </div>
  );
};

export default FiltroComp;
