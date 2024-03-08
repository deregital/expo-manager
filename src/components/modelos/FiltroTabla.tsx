'use client';
import { trpc } from '@/lib/trpc';
import { Input } from '../ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ComboBoxModelos from './ComboBoxModelos';
import EtiquetaComboBoxModelos from './EtiquetaComboBox';
import { SearchIcon } from 'lucide-react';
import { useDebounceValue } from 'usehooks-ts';
import { useEffect } from 'react';

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
    <div className='flex items-center justify-between'>
      <div className='flex items-center justify-center gap-x-5'>
        <ComboBoxModelos data={grupos ?? []} />
        <EtiquetaComboBoxModelos />
      </div>
      <div className='relative w-full max-w-[300px] pr-5'>
        <span className='pointer-events-none absolute inset-y-0 right-5 flex cursor-crosshair items-center pr-3 text-muted-foreground'>
          <SearchIcon className='h-5 w-5' />
        </span>
        <Input
          placeholder='Buscar por nombre o id legible'
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

export default FiltroTabla;
