'use client';
import { trpc } from '@/lib/trpc';
import { Edit2Icon, Trash2Icon } from 'lucide-react';
import Loader from '../ui/loader';
import { useTemplateDelete } from './DeleteTemplateModal';
import { useRouter } from 'next/navigation';
import { useTemplate } from './CreateTemplate';
import { type GetTemplatesData } from '@/server/types/whatsapp';
import IconClockRotateLeft from '../icons/IconClockRotateLeft';

const TemplatesList = () => {
  const { data, isLoading } = trpc.message.findTemplates.useQuery();
  const { clearTemplate } = useTemplate();
  const router = useRouter();

  function openModal(template: GetTemplatesData) {
    useTemplateDelete.setState({ open: true, template: template });
  }

  function goToCreateTemplate(template: GetTemplatesData | null, type: string) {
    clearTemplate();
    useTemplate.setState({ type: type });
    if (type === 'VIEW' || type === 'EDIT') {
      router.push(`/plantilla/${template?.name}`);
    } else {
      router.push(`/plantilla/crearplantilla`);
    }
  }

  return (
    <div className='m-2 mx-auto mt-5 max-w-[560px] border border-black bg-gray-300'>
      <div className='relative flex items-center justify-start border-b border-black bg-gray-500 p-2 text-white sm:justify-center'>
        <h1 className='text-sm sm:text-base'>Lista de plantillas</h1>
        <div className='absolute right-2 flex items-center justify-center gap-x-2'>
          <p className='text-sm sm:text-base'>Crear plantilla</p>
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
        ) : data?.templates ? (
          data.templates.map((p) => {
            const template = p;
            if (template.status === 'APPROVED') {
              return (
                <div
                  key={template.id}
                  className='flex items-center justify-start gap-x-2 bg-gray-400 pr-2 hover:bg-gray-700 hover:transition hover:ease-in-out sm:justify-center'
                  onClick={() => goToCreateTemplate(template, 'VIEW')}
                >
                  <button className='w-full p-2 text-white hover:cursor-default'>
                    {template.name}
                  </button>
                  <Edit2Icon
                    onClick={(e) => {
                      e.stopPropagation();
                      goToCreateTemplate(template, 'EDIT');
                    }}
                    className='hover:cursor-pointer hover:text-white'
                  />
                  <Trash2Icon
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(template);
                    }}
                    className='hover:cursor-pointer hover:text-white'
                  />
                </div>
              );
            } else if (template.status === 'PENDING') {
              return (
                <div
                  key={template.id}
                  className='flex items-center justify-center gap-x-2 bg-gray-400 pr-2'
                >
                  <button
                    onClick={() => goToCreateTemplate(template, 'VIEW')}
                    className='w-full p-2 text-white hover:bg-gray-700 hover:transition hover:ease-in-out'
                  >
                    {template.name}
                  </button>
                  <IconClockRotateLeft className='h-5 w-5' />
                </div>
              );
            }
          })
        ) : (
          'No hay plantillas'
        )}

        {/* <button className="bg-gray-400 text-white w-full p-2 hover:bg-gray-700 hover:ease-in-out hover:transition">Plantilla 1</button> */}
      </div>
    </div>
  );
};

export default TemplatesList;
