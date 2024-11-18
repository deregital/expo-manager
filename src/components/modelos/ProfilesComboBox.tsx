import { useEffect, useState } from 'react';

import { type RouterOutputs } from '@/server';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ComboBox from '@/components/ui/ComboBox';
import EtiquetasFillIcon from '@/components/icons/EtiquetasFillIcon';

const ProfilesComboBox = ({
  data,
}: {
  data: RouterOutputs['tagGroup']['getAll'];
}) => {
  const [open, setOpen] = useState(false);
  const searchParams = new URLSearchParams(useSearchParams());
  const [groupId, setGroupId] = useState(searchParams.get('grupoId') ?? '');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setGroupId(searchParams.get('grupoId') ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('grupoId')]);

  return (
    <ComboBox
      open={open}
      setOpen={setOpen}
      triggerChildren={
        <>
          <span className='truncate'>
            {groupId
              ? (data.find((group) => group.id === groupId)?.name ??
                'Buscar grupo...')
              : 'Buscar grupo...'}
          </span>
          <EtiquetasFillIcon className='h-5 w-5' />
        </>
      }
      data={data}
      id='id'
      value='name'
      onSelect={(value) => {
        setOpen(false);
        if (value === groupId) {
          setGroupId('');
          searchParams.delete('etiqueta');
          searchParams.delete('grupoId');
        } else {
          setGroupId(value);
          searchParams.set('grupoId', value);
          searchParams.delete('etiqueta');
        }
        router.push(`${pathname}?${searchParams.toString()}`);
      }}
      selectedIf={groupId}
      wFullMobile
    />
  );
};

export default ProfilesComboBox;
