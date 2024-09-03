'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useModelosTabla } from '@/components/modelos/table/ModelosTable';
import SwitchEventos from '@/components/ui/SwitchEventos';
import { create } from 'zustand';
import FiltroComp from '../ui/FiltroComp';
import { FuncionFiltrar } from '@/lib/filter';

export const useModelosFiltro = create(() => ({
  showEventos: false,
}));

const FiltroTabla = () => {
  const searchParams = new URLSearchParams(useSearchParams());
  const pathname = usePathname();
  const router = useRouter();
  const { showEventos } = useModelosFiltro();

  const { cantidadDeModelos, isLoadingModelos } = useModelosTabla((s) => ({
    isLoadingModelos: s.isLoading,
    cantidadDeModelos: s.cantidad,
  }));

  const filtrar: FuncionFiltrar = ({ etiquetaId, input, grupoId }) => {
    if (!grupoId) {
      searchParams.delete('grupoId');
    } else {
      searchParams.set('grupoId', grupoId);
    }
    if (!etiquetaId) {
      searchParams.delete('etiqueta');
    } else {
      searchParams.set('etiqueta', etiquetaId);
    }
    if (!input) {
      searchParams.delete('nombre');
    } else {
      searchParams.set('nombre', input);
    }
    router.push(`${pathname}?${searchParams.toString()}`);
  };

  return (
    <div className='flex items-center justify-between gap-x-4'>
      <FiltroComp mostrarInput mostrarEtiq funcionFiltrado={filtrar} />
      <div className='mr-5 flex items-center justify-center gap-x-4'>
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
    </div>
  );
};

export default FiltroTabla;
