'use client';
import { trpc } from '@/lib/trpc';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ComboBoxModelos from './ComboBoxModelos';
import EtiquetaComboBoxModelos from './EtiquetaComboBox';
import { useDebounceValue } from 'usehooks-ts';
import { useEffect } from 'react';
import SearchInput from '@/components/ui/SearchInput';

const FiltroTabla = () => {
  const searchParams = new URLSearchParams(useSearchParams());
  const [search, setSearch] = useDebounceValue('', 500);
  const pathname = usePathname();
  const router = useRouter();
  const { data: grupos } = trpc.grupoEtiqueta.getAll.useQuery();

  useEffect(() => {
    if (search === '') {
      searchParams.delete('nombre');
    } else {
      searchParams.set('nombre', search);
    }
    router.push(`${pathname}?${searchParams.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, router, search]);

  return (
    <div className='flex flex-col items-center justify-between gap-4 p-3 md:flex-row md:p-5'>
      <div className='flex w-full flex-col items-center gap-4 md:flex-row'>
        <ComboBoxModelos data={grupos ?? []} />
        <EtiquetaComboBoxModelos />
      </div>
      <div className='relative w-full md:max-w-[300px]'>
        <SearchInput
          placeholder='Buscar por nombre o ID legible'
          onChange={setSearch}
        />
      </div>
    </div>
  );
};

export default FiltroTabla;
