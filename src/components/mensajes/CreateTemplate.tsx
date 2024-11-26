'use client';
import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { trpc } from '@/lib/trpc';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { create } from 'zustand';
import { useRouter } from 'next/navigation';
import Loader from '../ui/loader';
import { Textarea } from '@/components/ui/textarea';

export const useTemplate = create<{
  type: string;
  name: string;
  id: string;
  button1: string;
  button2: string;
  button3: string;
  content: string;
  clearTemplate: () => void;
}>((set) => ({
  type: '',
  name: '',
  id: '',
  button1: '',
  button2: '',
  button3: '',
  content: '',
  clearTemplate: () => {
    set({
      type: '',
      name: '',
      id: '',
      button1: '',
      button2: '',
      button3: '',
      content: '',
    });
  },
}));

const CreateTemplate = ({
  templateName,
  typeTemplate,
}: {
  templateName?: string;
  typeTemplate: string;
}) => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const { type, name, button1, button2, button3, content, clearTemplate } =
    useTemplate();
  const router = useRouter();
  const { data } = trpc.message.findTemplateById.useQuery(templateName ?? '', {
    enabled: type === 'VIEW' || type === 'EDIT',
  });

  useEffect(() => {
    setIsButtonDisabled(!(name && content));
  }, [name, content]);

  useEffect(() => {
    useTemplate.setState({ type: typeTemplate });
    if (type === '' || (typeTemplate === '' && templateName !== undefined))
      useTemplate.setState({ type: 'VIEW' });
    if (typeTemplate === 'CREATE') useTemplate.setState({ type: 'CREATE' });
    if (type === 'VIEW' || type === 'EDIT')
      useTemplate.setState({ name: templateName });
  }, [templateName, type, typeTemplate]);

  useEffect(() => {
    useTemplate.setState({ id: data?.id });
    if (data?.components) {
      data.components.map((component) => {
        if (component.type === 'BODY') {
          useTemplate.setState({ content: component.text });
        } else if (component.type === 'BUTTONS') {
          component.buttons.forEach((button, index) => {
            if (index === 0) {
              useTemplate.setState({ button1: button.text });
            } else if (index === 1) {
              useTemplate.setState({ button2: button.text });
            } else if (index === 2) {
              useTemplate.setState({ button3: button.text });
            }
          });
        }
      });
    }
  }, [data]);

  const crearTemplate = trpc.message.createTemplate.useMutation();
  const editTemplate = trpc.message.updateTemplate.useMutation();

  async function handleCreateTemplate() {
    if (type === 'CREATE') {
      await crearTemplate
        .mutateAsync({
          name: name ?? '',
          content: content ?? '',
          buttons: [button1 ?? '', button2 ?? '', button3 ?? ''],
        })
        .then(() => {
          toast.success(
            'Plantilla creada correctamente. Por favor recargue la página dentro de poco para actualizar el estado de la plantilla',
            { duration: 5000 }
          );
          clearTemplate();
          router.push('/plantilla');
        })
        .catch((error) => {
          const errorMessage = JSON.parse(error.message)[0].message;

          toast.error(errorMessage);
        });
    } else if (type === 'EDIT') {
      await editTemplate
        .mutateAsync({
          id: name ?? '',
          content: content ?? '',
          buttons: [button1 ?? '', button2 ?? '', button3 ?? ''],
        })
        .then(() => {
          toast.success('Plantilla editada correctamente');
          clearTemplate();
          router.push('/plantilla');
        })
        .catch((error) => {
          const errorMessage = JSON.parse(error.message)[0].message;

          toast.error(errorMessage);
        });
    }
  }

  return (
    <>
      <div className='mx-auto max-w-[550px] px-3 py-5'>
        <div className='flex items-center justify-center'>
          <h1 className='pb-3 font-bold'>
            {type === 'EDIT'
              ? `Edición de la plantilla: ${name}`
              : type === 'CREATE'
                ? 'Creación de plantilla'
                : `Vista de la plantilla - ${name}`}
          </h1>
        </div>
        <h3 className='pb-1 font-semibold'>Nombre de la plantilla:</h3>
        <Input
          disabled={type === 'VIEW' || type === 'EDIT'}
          className='mb-3 disabled:opacity-100'
          placeholder='Nombre de la plantilla'
          value={name}
          onChange={(e) => useTemplate.setState({ name: e.target.value })}
        />
        <h3 className='pb-1 font-semibold'>Contenido del mensaje:</h3>
        <Textarea
          disabled={type === 'VIEW'}
          value={content}
          onChange={(e) => useTemplate.setState({ content: e.target.value })}
          className='min-h-40 w-full resize-none disabled:opacity-100'
          placeholder='Cuerpo del mensaje'
        />
        <h3 className='pb-1 font-semibold'>Botones del mensaje: (opcional)</h3>
        <div className='flex flex-col items-center justify-between gap-y-3 pb-3 sm:flex-row'>
          <Input
            disabled={type === 'VIEW'}
            placeholder='Botón 1'
            className='w-full disabled:opacity-100 sm:w-[150px]'
            value={button1}
            onChange={(e) => useTemplate.setState({ button1: e.target.value })}
          />
          <Input
            disabled={type === 'VIEW'}
            placeholder='Botón 2'
            className='w-full disabled:opacity-100 sm:w-[150px]'
            value={button2}
            onChange={(e) => useTemplate.setState({ button2: e.target.value })}
          />
          <Input
            disabled={type === 'VIEW'}
            placeholder='Botón 3'
            className='w-full disabled:opacity-100 sm:w-[150px]'
            value={button3}
            onChange={(e) => useTemplate.setState({ button3: e.target.value })}
          />
        </div>
        <div className='flex items-center justify-end gap-x-3 pb-3'>
          {type !== 'VIEW' && (
            <Button
              disabled={
                isButtonDisabled ||
                crearTemplate.isLoading ||
                editTemplate.isLoading
              }
              className='flex items-center justify-center gap-x-2'
              onClick={handleCreateTemplate}
            >
              {crearTemplate.isLoading && (
                <Loader className='h-5 w-5 animate-spin fill-primary text-gray-200 dark:text-gray-600' />
              )}
              <p>{type === 'EDIT' ? 'Editar' : 'Crear'}</p>
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateTemplate;
