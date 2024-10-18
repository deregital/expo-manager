'use client';
import { useEffect, useMemo, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import ComboBox from '@/components/ui/ComboBox';
import EtiquetaFillIcon from '@/components/icons/EtiquetaFillIcon';

const EtiquetaComboBoxModelos = () => {
  const [open, setOpen] = useState(false);
  const searchParams = new URLSearchParams(useSearchParams());
  const [tagId, setTagId] = useState(searchParams.get('etiqueta') ?? '');
  const pathname = usePathname();
  const router = useRouter();
  const { data, isLoading } =
    searchParams.get('grupoId') === null
      ? trpc.tag.getAll.useQuery()
      : trpc.tag.getByGroupId.useQuery(`${searchParams.get('grupoId')}`);

  const filteredTags = useMemo(() => {
    return data?.filter(
      (tag) => tag.type !== 'PARTICIPANT' && tag.type !== 'NOT_IN_SYSTEM'
    );
  }, [data]);

  useEffect(() => {
    setTagId(searchParams.get('etiqueta') ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('etiqueta')]);

  return (
    <ComboBox
      open={open}
      isLoading={isLoading}
      setOpen={setOpen}
      triggerChildren={
        <>
          <span className='truncate'>
            {tagId
              ? (filteredTags?.find((tag) => tag.id === tagId)?.name ??
                'Buscar etiqueta...')
              : 'Buscar etiqueta...'}
          </span>
          <EtiquetaFillIcon className='h-5 w-5' />
        </>
      }
      data={filteredTags ?? []}
      id='id'
      value='name'
      onSelect={(value) => {
        setOpen(false);
        if (value === tagId) {
          setTagId('');
          searchParams.delete('etiqueta');
        } else {
          setTagId(value);
          searchParams.set('etiqueta', value);
        }
        router.push(`${pathname}?${searchParams.toString()}`);
      }}
      selectedIf={tagId}
      wFullMobile
    />
  );
};

export default EtiquetaComboBoxModelos;
