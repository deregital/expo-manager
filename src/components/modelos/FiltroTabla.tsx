'use client';
import { trpc } from '@/lib/trpc';
import { Input } from '../ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ComboBoxModelos from './ComboBoxModelos';

export default function FiltroTabla() {
  const searchParams = new URLSearchParams(useSearchParams());
  const pathname = usePathname();
  const router = useRouter();
  const { data: Grupos } = trpc.grupoEtiqueta.getAll.useQuery();
  return (
    <>
      <ComboBoxModelos data={Grupos ?? []} />
      <Input
        placeholder='Buscar por nombre o id legible'
        onChange={(e) => {
          searchParams.set('nombre', e.target.value);
          router.push(`${pathname}?${searchParams.toString()}`);
        }}
      />
    </>
  );
}
