import { useState } from 'react';

import { RouterOutputs } from '@/server';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ComboBox from '@/components/ui/ComboBox';

const ComboBoxModelos = ({
  data,
}: {
  data: RouterOutputs['grupoEtiqueta']['getAll'];
}) => {
  const [open, setOpen] = useState(false);
  const searchParams = new URLSearchParams(useSearchParams());
  const [grupoId, setGrupoId] = useState(searchParams.get('grupoId') ?? '');
  const pathname = usePathname();
  const router = useRouter();

  return (
    <ComboBox
      open={open}
      setOpen={setOpen}
      triggerText={
        grupoId
          ? data.find((grupo) => grupo.id === grupoId)?.nombre ??
            'Buscar grupo...'
          : 'Buscar grupo...'
      }
      data={data}
      id='id'
      value='nombre'
      onSelect={(value) => {
        setOpen(false);
        if (value === grupoId) {
          setGrupoId('');
          searchParams.delete('grupoId');
        } else {
          setGrupoId(value);
          searchParams.set('grupoId', value);
          searchParams.delete('etiqueta');
        }
        router.push(`${pathname}?${searchParams.toString()}`);
      }}
      selectedIf={grupoId}
    />
  );
};

export default ComboBoxModelos;
