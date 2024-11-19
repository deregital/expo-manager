'use client';
import UpdateGlobalFilter from '@/components/configuracion/ActualizarFiltroBase';
import DescargarDB from '@/components/configuracion/DescargarDB';
//import DispositivoComoNoti from '@/components/configuracion/DispositivoComoNoti';

const ConfiguracionPage = () => {
  return (
    <div className='flex flex-col gap-y-5 p-3 md:p-5 '>
      <p className='text-xl font-bold md:text-3xl'>Configuración</p>
      <DescargarDB />
      <UpdateGlobalFilter />
      {/* <DispositivoComoNoti /> */}
    </div>
  );
};

export default ConfiguracionPage;
