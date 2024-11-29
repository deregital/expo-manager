import { useMemo, useState } from 'react';

import { useEtiquetaModalData } from './EtiquetaModal';
import { RouterOutputs } from '@/server';
import ComboBox from '@/components/ui/ComboBox';
import EtiquetasFillIcon from '@/components/icons/EtiquetasFillIcon';

const GrupoEtiquetaComboBox = ({
  data,
}: {
  data: RouterOutputs['grupoEtiqueta']['getAll'];
}) => {
  const modalData = useEtiquetaModalData((state) => ({
    tipo: state.tipo,
    nombre: state.nombre,
    grupoId: state.grupoId,
  }));
  const [open, setOpen] = useState(false);

  const currentGrupo = useMemo(() => {
    return data.find((grupo) => grupo.id === modalData.grupoId);
  }, [data, modalData.grupoId]);

  return (
    <ComboBox
      data={data}
      open={open}
      setOpen={setOpen}
      buttonClassName='flex w-full max-w-[200px] justify-between gap-x-2'
      triggerChildren={
        <>
          <span className='max-w-[calc(100%-30px)] truncate'>
            {modalData.grupoId ? currentGrupo?.nombre : 'Buscar grupo...'}
          </span>
          <EtiquetasFillIcon className='h-5 w-5' />
        </>
      }
      id='id'
      value='nombre'
      onSelect={(id) => {
        setOpen(false);
        useEtiquetaModalData.setState({
          grupoId: id,
        });
      }}
      selectedIf={modalData.grupoId}
    />
  );
};

export default GrupoEtiquetaComboBox;
