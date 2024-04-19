'use client';
import { useState } from 'react';
import ComboBox from '../ui/ComboBox';
import { RouterOutputs } from '@/server';
import EtiquetasFillIcon from '../icons/EtiquetasFillIcon';
import { useEnviarTemplate } from './EnviarTemplate';

const ComboBoxPlantillas = ({
  data,
}: {
  data: RouterOutputs['whatsapp']['getTemplates'];
}) => {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  return (
    <>
    </>
    // <ComboBox
    //   open={open}
    //   setOpen={setOpen}
    //   triggerChildren={
    //     <>
    //       <span className='truncate'>
    //         {titulo
    //           ? data.find((p) => p.titulo === titulo)?.titulo ??
    //             'Buscar plantilla...'
    //           : 'Buscar plantilla...'}
    //       </span>
    //       <EtiquetasFillIcon className='h-5 w-5' />
    //     </>
    //   }
    //   data={data}
    //   id='titulo'
    //   value='titulo'
    //   onSelect={(value) => {
    //     console.log('value', value);
    //     setOpen(false);
    //     if (value === titulo) {
    //       setTitulo('');
    //       useEnviarTemplate.setState({ plantilla: '' });
    //     } else {
    //       setTitulo(value);
    //       useEnviarTemplate.setState({ plantilla: value });
    //     }
    //   }}
    //   selectedIf={titulo}
    //   wFullMobile
    // />
  );
};

export default ComboBoxPlantillas;
