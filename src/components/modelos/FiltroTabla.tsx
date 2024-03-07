'use client';
import { trpc } from '@/lib/trpc';
import { Input } from '../ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ComboBoxModelos from './ComboBoxModelos';
import EtiquetaComboBoxModelos from './EtiquetaComboBox';
import { SearchIcon } from 'lucide-react';

export default function FiltroTabla() {
  const searchParams = new URLSearchParams(useSearchParams());
  const pathname = usePathname();
  const router = useRouter();
  const { data: Grupos } = trpc.grupoEtiqueta.getAll.useQuery();
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center justify-center gap-x-5'>
        <ComboBoxModelos data={Grupos ?? []} />
        <EtiquetaComboBoxModelos />
      </div>
      <div className='relative w-full max-w-[300px] pr-5'>
        <span className='pointer-events-none absolute inset-y-0 right-5 flex cursor-crosshair items-center pr-3 text-muted-foreground'>
          <SearchIcon className='h-5 w-5' />
        </span>
        <Input
          placeholder='Buscar por nombre o id legible'
          onChange={(e) => {
            searchParams.set('nombre', e.target.value);
            router.push(`${pathname}?${searchParams.toString()}`);
          }}
        />
      </div>
    </div>
  );
}
