'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ComponentProps, useState } from 'react';
import { useModelosTabla } from '@/components/modelos/table/ModelosTable';
import SwitchEventos from '@/components/ui/SwitchEventos';
import { create } from 'zustand';
import FiltroComp from '../ui/FiltroComp';

export const useModelosFiltro = create(() => ({
  showEventos: false,
}));

const FiltroTabla = () => {
  const searchParams = new URLSearchParams(useSearchParams());
  const [search, setSearch] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { showEventos } = useModelosFiltro();
  // const { data: grupos } = trpc.grupoEtiqueta.getAll.useQuery();

  const { cantidadDeModelos, isLoadingModelos } = useModelosTabla((s) => ({
    isLoadingModelos: s.isLoading,
    cantidadDeModelos: s.cantidad,
  }));

  // async function resetFilters() {
  //   searchParams.delete('grupoId');
  //   searchParams.delete('etiqueta');
  //   searchParams.delete('nombre');
  //   router.push(`${pathname}?${searchParams.toString()}`);
  // }

  // useEffect(() => {
  //   if (search === '') {
  //     searchParams.delete('nombre');
  //   } else {
  //     searchParams.set('nombre', search);
  //   }
  //   router.push(`${pathname}?${searchParams.toString()}`);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [search]);

  // useEffect(() => {
  //   setSearch(searchParams.get('nombre') ?? '');
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [searchParams.get('nombre')]);
  const filtrar: ComponentProps<typeof FiltroComp>['funcionFiltrado'] = ({
    etiquetasId,
    input,
    grupoId,
  }) => {
    if (!grupoId) {
      searchParams.delete('grupoId');
    } else {
      searchParams.set('grupoId', grupoId);
    }
    if (!etiquetasId) {
      searchParams.delete('etiqueta');
    } else {
      searchParams.set('etiqueta', etiquetasId);
    }
    if (!input) {
      searchParams.delete('nombre');
    } else {
      searchParams.set('nombre', input);
    }
    router.push(`${pathname}?${searchParams.toString()}`);
  };
  return (
    // <div className='flex flex-col items-center justify-between gap-4 p-3 md:flex-row md:p-5'>
    //   <div className='flex w-full flex-col items-center gap-4 md:flex-row'>
    //     <ComboBoxModelos
    //       data={
    //         grupos?.filter(
    //           (grupo) =>
    //             grupo.etiquetas.length > 0 &&
    //             grupo.etiquetas.every(
    //               (e) =>
    //                 e.tipo !== TipoEtiqueta.MODELO &&
    //                 e.tipo !== TipoEtiqueta.TENTATIVA
    //             )
    //         ) ?? []
    //       }
    //     />
    //     <EtiquetaComboBoxModelos />
    //     {!isLoadingModelos && (
    //       <p className='self-start text-sm text-black/80 md:self-end'>
    //         {cantidadDeModelos === 0
    //           ? 'No se encontraron participantes'
    //           : cantidadDeModelos === 1
    //             ? '1 participante encontrado'
    //             : `${cantidadDeModelos} participantes encontrados`}
    //       </p>
    //     )}
    //   </div>
    //   <div className='flex w-full min-w-[320px] items-center justify-end gap-x-4 md:w-fit'>
    //     <SwitchEventos
    //       setShowEventos={(value) => {
    //         useModelosFiltro.setState({ showEventos: value });
    //       }}
    //       showEventos={showEventos}
    //     />
    //     <div className='relative mr-auto w-full'>
    //       <SearchInput
    //         className='w-full'
    //         placeholder='Buscar por nombre o ID legible'
    //         onChange={setSearch}
    //         value={search}
    //       />
    //     </div>
    //     <XIcon className='h-4 w-4 cursor-pointer' onClick={resetFilters} />
    //   </div>
    // </div>
    <div className='flex items-center justify-center gap-x-4'>
      <FiltroComp mostrarInput mostrarEtiq funcionFiltrado={filtrar} />
      <SwitchEventos
        setShowEventos={(value) => {
          useModelosFiltro.setState({ showEventos: value });
        }}
        showEventos={showEventos}
      />
      {!isLoadingModelos && (
        <p className='self-start text-sm text-black/80 md:self-end'>
          {cantidadDeModelos === 0
            ? 'No se encontraron participantes'
            : cantidadDeModelos === 1
              ? '1 participante encontrado'
              : `${cantidadDeModelos} participantes encontrados`}
        </p>
      )}
    </div>
  );
};

export default FiltroTabla;
