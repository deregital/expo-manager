'use client';
import { trpc } from '@/lib/trpc';
import { Input } from '../ui/input';
import { useDebounceValue } from 'usehooks-ts';
import { useSearchParams } from 'next/navigation';
import ComboBoxModelos from './ComboBoxModelos';

export default function FiltroTabla() {
  const [search, setSearch] = useDebounceValue('', 500);
  const searchParams = new URLSearchParams(useSearchParams());

  const { data: Grupos } = trpc.grupoEtiqueta.getAll.useQuery();
  return (
    <>
      <ComboBoxModelos data={Grupos ?? []} />
      <Input
        placeholder='Buscar por nombre o id legible'
        onChange={(e) => {}}
      />
    </>
  );
}
