'use client';
import { trpc } from '@/lib/trpc';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ComboBoxModelos from './ComboBoxModelos';
import EtiquetaComboBoxModelos from './EtiquetaComboBox';
import { useEffect, useState } from 'react';
import SearchInput from '@/components/ui/SearchInput';
import { useModelosTabla } from '@/components/modelos/table/ModelosTable';
import { TipoEtiqueta } from '@prisma/client';
import { XIcon } from 'lucide-react';

const FiltroTabla = () => {
  const searchParams = new URLSearchParams(useSearchParams());
  const [search, setSearch] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { data: grupos } = trpc.grupoEtiqueta.getAll.useQuery();

  const { cantidadDeModelos, isLoadingModelos } = useModelosTabla((s) => ({
    isLoadingModelos: s.isLoading,
    cantidadDeModelos: s.cantidad,
  }));

  async function resetFilters() {
    searchParams.delete('grupoId');
    searchParams.delete('etiqueta');
    searchParams.delete('nombre');
    router.push(`${pathname}?${searchParams.toString()}`);
  }

  useEffect(() => {
    if (search === '') {
      searchParams.delete('nombre');
    } else {
      searchParams.set('nombre', search);
    }
    router.push(`${pathname}?${searchParams.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    setSearch(searchParams.get('nombre') ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('nombre')]);

  return (
    <div className='flex flex-col items-center justify-between gap-4 p-3 md:flex-row md:p-5'>
      <div className='flex w-full flex-col items-center gap-4 md:flex-row'>
        <ComboBoxModelos
          data={
            grupos?.filter(
              (grupo) =>
                grupo.etiquetas.length > 0 &&
                grupo.etiquetas.every(
                  (e) =>
                    e.tipo !== TipoEtiqueta.MODELO &&
                    e.tipo !== TipoEtiqueta.TENTATIVA
                )
            ) ?? []
          }
        />
        <EtiquetaComboBoxModelos />
        {!isLoadingModelos && (
          <p className='self-start text-sm text-black/80 md:self-end'>
            {cantidadDeModelos === 0
              ? 'No se encontraron modelos'
              : cantidadDeModelos === 1
                ? '1 modelo encontrada'
                : `${cantidadDeModelos} modelos encontradas`}
          </p>
        )}
      </div>
      <div className='flex w-full min-w-[300px] items-center justify-end gap-x-4 md:w-fit'>
        <div className='relative mr-auto w-full'>
          <SearchInput
            className='w-full'
            placeholder='Buscar por nombre o ID legible'
            onChange={setSearch}
            value={search}
          />
        </div>
        <XIcon className='h-4 w-4 cursor-pointer' onClick={resetFilters} />
      </div>
    </div>
  );
};

export default FiltroTabla;
