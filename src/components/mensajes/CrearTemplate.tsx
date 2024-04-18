'use client';
import { use, useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { trpc } from '@/lib/trpc';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { create } from 'zustand';
import { useRouter } from 'next/navigation';
import { GetTemplatesData } from '@/server/types/whatsapp';
import Loader from '../ui/loader';

export const useTemplate = create<{
  type: string;
  plantilla: GetTemplatesData | null;
  button1: string | undefined;
  button2: string | undefined;
  button3: string | undefined;
  content: string | undefined;
}>((set) => ({
  type: '',
  plantilla: null,
  button1: undefined,
  button2: undefined,
  button3: undefined,
  content: undefined,
}));

const CrearTemplate = () => {
  const [type, setType] = useState<string>(useTemplate.getState().type);
  // const [button1, setButton1] = useState<string>('');
  // const [button2, setButton2] = useState<string>('');
  // const [button3, setButton3] = useState<string>('');
  // const [content, setContent] = useState<string>('');
  // const [name, setName] = useState<string | undefined>(
  //   useTemplate.getState().plantilla?.name
  // );
  const router = useRouter();
  const { data, isLoading } = trpc.whatsapp.getTemplateById.useQuery(useTemplate.getState().plantilla?.name, {
    enabled: useTemplate.getState().type === 'VIEW' || useTemplate.getState().type === 'EDIT',
  });
    useEffect(() => {
        if (data?.data[0].components) {
          data.data[0].components.map((component) => {
            if (component.type === 'BODY') {
              useTemplate.setState({ content: component.text });
            } else if (component.type === 'BUTTONS') {
              component.buttons.forEach((button, index) => {
                if (index === 0) {
                  // setButton1(button.text);
                  useTemplate.setState({ button1: button.text });
                } else if (index === 1) {
                  // setButton2(button.text);
                  useTemplate.setState({ button2: button.text });
                } else if (index === 2) {
                  // setButton3(button.text);
                  useTemplate.setState({ button3: button.text });
                }
              });
            }
          });
        }
    }, [data]);

  const crearTemplate = trpc.whatsapp.createTemplate.useMutation();
  const editTemplate = trpc.whatsapp.editTemplate.useMutation();
  async function handleCreateTemplate() {
    if (useTemplate.getState().type === 'CREATE') {
      await crearTemplate
        .mutateAsync({
          name: useTemplate.getState().plantilla?.name ? useTemplate.getState().plantilla?.name : undefined,
          content: useTemplate.getState().content ? useTemplate.getState().content : undefined,
          buttons: [useTemplate.getState().button1 ? useTemplate.getState().button1 as string : '', useTemplate.getState().button2 ? useTemplate.getState().button2 as string : '', useTemplate.getState().button3 ? useTemplate.getState().button3 as string : ''],
        })
        .then(() => {
          toast.success('Plantilla creada correctamente');
          // setButton1('');
          // setButton2('');
          // setButton3('');
          // setContent('');
          // setName('');
          router.push('/mensajes');
        })
        .catch((error) => {
          toast.error(error.message);
        });
    } else if (useTemplate.getState().type === 'EDIT') {
      await editTemplate
        .mutateAsync({
          metaId: useTemplate.getState().plantilla!.id,
          content: useTemplate.getState().content ? useTemplate.getState().content as string : '',
          buttons: [useTemplate.getState().button1 ? useTemplate.getState().button1 as string : '', useTemplate.getState().button2 ? useTemplate.getState().button2 as string : '', useTemplate.getState().button3 ? useTemplate.getState().button3 as string : ''],
        })
        .then(() => {
          toast.success('Plantilla editada correctamente');
          // setButton1('');
          // setButton2('');
          // setButton3('');
          // setContent('');
          // setName('');
          router.push('/mensajes');
        })
        .catch((error) => {
          toast.error(error.message);
        });
    }
  }
  return (
    <>
      <div className='mx-auto max-w-[550px] px-3 py-5'>
        <div className='flex items-center justify-center'>
          <h1 className='pb-3 font-bold'>
            {useTemplate.getState().type === 'EDIT'
              ? `Edición de la plantilla: ${useTemplate.getState().plantilla?.name}`
               : useTemplate.getState().type === 'CREATE' ? 'Creación de plantilla' : `Vista de la plantilla - ${useTemplate.getState().plantilla?.name}`}
          </h1>
        </div>
        <h3 className='pb-1 font-semibold'>Nombre de la plantilla:</h3>
        <Input
          disabled={useTemplate.getState().type === 'VIEW' || useTemplate.getState().type === 'EDIT'}
          className='mb-3 disabled:opacity-100'
          placeholder='Nombre de la plantilla'
          value={useTemplate.getState().plantilla?.name}
          onChange={(e) => useTemplate.setState({ plantilla: { ...useTemplate.getState().plantilla, name: e.target.value as string } })}
        />
        <h3 className='pb-1 font-semibold'>Contenido del mensaje:</h3>
        <textarea
          disabled={useTemplate.getState().type === 'VIEW'}
          value={useTemplate.getState().content}
          onChange={(e) => useTemplate.setState({ content: e.target.value })}
          className='min-h-40 w-full disabled:opacity-100'
          placeholder='Cuerpo del mensaje'
        ></textarea>
        <h3 className='pb-1 font-semibold'>Botones del mensaje: (opcional)</h3>
        <div className='flex items-center justify-between pb-3'>
          <Input
            disabled={useTemplate.getState().type === 'VIEW'}
            placeholder='Botón 1'
            className='w-[150px] disabled:opacity-100'
            value={useTemplate.getState().button1}
            onChange={(e) => useTemplate.setState({ button1: e.target.value })}
          />
          <Input
            disabled={useTemplate.getState().type === 'VIEW'}
            placeholder='Botón 2'
            className='w-[150px] disabled:opacity-100'
            value={useTemplate.getState().button2}
            onChange={(e) => useTemplate.setState({ button2: e.target.value })}
          />
          <Input
            disabled={useTemplate.getState().type === 'VIEW'}
            placeholder='Botón 3'
            className='w-[150px] disabled:opacity-100'
            value={useTemplate.getState().button3}
            onChange={(e) => useTemplate.setState({ button3: e.target.value })}
          />
        </div>
        <div className='flex items-center justify-end gap-x-3 pb-3'>
          {useTemplate.getState().type !== 'VIEW' && (            
          <Button
            disabled={crearTemplate.isLoading || editTemplate.isLoading}
            className='flex items-center justify-center gap-x-2'
            onClick={handleCreateTemplate}
          >
            {crearTemplate.isLoading && (
              <Loader className='h-5 w-5 animate-spin fill-primary text-gray-200 dark:text-gray-600' />
            )}
            <p>{useTemplate.getState().type === 'EDIT' ? 'Editar' : 'Crear'}</p>
          </Button>
          )}
        </div>
      </div>
    </>
  );
};


export default CrearTemplate;
