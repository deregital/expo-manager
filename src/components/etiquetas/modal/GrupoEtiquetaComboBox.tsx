import { useMemo, useState } from 'react';

import { useTagModalData } from './EtiquetaModal';
import { RouterOutputs } from '@/server';
import ComboBox from '@/components/ui/ComboBox';
import EtiquetasFillIcon from '@/components/icons/EtiquetasFillIcon';

const GrupoEtiquetaComboBox = ({
  data,
}: {
  data: RouterOutputs['tagGroup']['getAll'];
}) => {
  const modalData = useTagModalData((state) => ({
    tipo: state.type,
    nombre: state.name,
    groupId: state.groupId,
  }));
  const [open, setOpen] = useState(false);

  const currentGroup = useMemo(() => {
    return data.find((group) => group.id === modalData.groupId);
  }, [data, modalData.groupId]);

  return (
    <ComboBox
      data={data}
      open={open}
      setOpen={setOpen}
      buttonClassName='flex w-full max-w-[200px] justify-between gap-x-2'
      triggerChildren={
        <>
          <span className='max-w-[calc(100%-30px)] truncate'>
            {modalData.groupId ? currentGroup?.name : 'Buscar grupo...'}
          </span>
          <EtiquetasFillIcon className='h-5 w-5' />
        </>
      }
      id='id'
      value='name'
      onSelect={(id) => {
        setOpen(false);
        useTagModalData.setState({
          groupId: id,
        });
      }}
      selectedIf={modalData.groupId}
    />
  );
};

export default GrupoEtiquetaComboBox;
