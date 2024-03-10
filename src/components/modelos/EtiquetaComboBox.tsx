'use client';
import { useEffect, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import ComboBox from '@/components/ui/ComboBox';

const EtiquetaComboBoxModelos = () => {
  const [open, setOpen] = useState(false);
  const searchParams = new URLSearchParams(useSearchParams());
  const [etiquetaId, setEtiquetaId] = useState(
    searchParams.get('etiqueta') ?? ''
  );
  const pathname = usePathname();
  const router = useRouter();
  const { data } =
    searchParams.get('grupoId') === null
      ? trpc.etiqueta.getAll.useQuery()
      : trpc.etiqueta.getByGrupoEtiqueta.useQuery(
          `${searchParams.get('grupoId')}`
        );

  useEffect(() => {
    setEtiquetaId(searchParams.get('etiqueta') ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('etiqueta')]);

  return (
    <ComboBox
      open={open}
      setOpen={setOpen}
      triggerChildren={
        <span className='truncate'>
          {etiquetaId
            ? data?.find((etiqueta) => etiqueta.id === etiquetaId)?.nombre ??
              'Buscar etiqueta...'
            : 'Buscar etiqueta...'}
        </span>
      }
      data={data ?? []}
      id='id'
      value='nombre'
      onSelect={(value) => {
        setOpen(false);
        if (value === etiquetaId) {
          setEtiquetaId('');
          searchParams.delete('etiqueta');
        } else {
          setEtiquetaId(value);
          searchParams.set('etiqueta', value);
        }
        router.push(`${pathname}?${searchParams.toString()}`);
      }}
      selectedIf={etiquetaId}
    />
  );
};

export default EtiquetaComboBoxModelos;
