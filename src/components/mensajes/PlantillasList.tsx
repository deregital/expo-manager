'use client';
import { trpc } from '@/lib/trpc';
import { Edit2Icon, Trash2Icon } from 'lucide-react';
import Loader from '../ui/loader';
import { useTemplateDelete } from './DeleteTemplateModal';
import { RouterOutputs } from '@/server';
import { useRouter } from 'next/navigation';
import { useTemplate } from './CrearTemplate';

const PlantillasList = () => {
  const { data, isLoading } = trpc.whatsapp.getTemplates.useQuery();
  const router = useRouter();

  function openModal(plantilla: RouterOutputs['whatsapp']['getTemplateById']) {
    useTemplateDelete.setState({ open: true, plantilla: plantilla });
  }

  function goToCreateTemplate(
    plantilla: RouterOutputs['whatsapp']['getTemplateById'],
    type: string
  ) {
    useTemplate.setState({ type: type, plantilla: plantilla });
    router.push('/mensajes/plantilla');
  }

  return (
    <div className='mx-auto mt-5 max-w-[600px] border border-black bg-gray-300'>
      <div className='relative flex items-center justify-center border-b border-black bg-gray-500 py-2 text-white'>
        <h1>Lista de plantillas</h1>
        <div className='absolute right-2 flex items-center justify-center gap-x-2'>
          <p>Crear plantilla</p>
          <button
            onClick={() => goToCreateTemplate(null, 'CREATE')}
            className='rounded-md bg-gray-400 px-2 py-0.5 text-white hover:bg-gray-700 hover:transition hover:ease-in-out'
          >
            +
          </button>
        </div>
      </div>
      <div className='h-32 overflow-y-auto'>
        {isLoading ? (
          <div className='mx-auto mt-2 w-fit'>
            <Loader />
          </div>
        ) : data ? (
          (data as Array<any>).map((p) => {
            const plantilla: RouterOutputs['whatsapp']['getTemplates'][number] =
              p;
            return (
              <div
                key={plantilla.id}
                className='flex items-center justify-center gap-x-2 bg-gray-400 pr-2'
              >
                <button className='w-full p-2 text-white hover:bg-gray-700 hover:transition hover:ease-in-out'>
                  {plantilla.titulo}
                </button>
                <Edit2Icon
                  onClick={() => goToCreateTemplate(plantilla, 'EDIT')}
                  className='hover:cursor-pointer hover:text-white'
                />
                <Trash2Icon
                  onClick={() => openModal(plantilla)}
                  className='hover:cursor-pointer hover:text-white'
                />
              </div>
            );
          })
        ) : (
          'No hay plantillas'
        )}

        {/* <button className="bg-gray-400 text-white w-full p-2 hover:bg-gray-700 hover:ease-in-out hover:transition">Plantilla 1</button> */}
      </div>
    </div>
  );
};

export default PlantillasList;
