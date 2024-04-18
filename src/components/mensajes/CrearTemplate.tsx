'use client';
import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { trpc } from '@/lib/trpc';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { create } from 'zustand';
import { useRouter } from 'next/navigation';
import { GetTemplatesData } from '@/server/types/whatsapp';

export const useTemplate = create<{
  type: string;
  plantilla: GetTemplatesData | null;
}>((set) => ({
  type: '',
  plantilla: null,
}));

const CrearTemplate = () => {
  const [type, setType] = useState<string>(useTemplate.getState().type);
  const [button1, setButton1] = useState<string>('');
  const [button2, setButton2] = useState<string>('');
  const [button3, setButton3] = useState<string>('');
  const [content, setContent] = useState<string | undefined>();
  const [name, setName] = useState<string | undefined>(
    useTemplate.getState().plantilla?.name
  );
  const router = useRouter();
  const { data, isLoading } = trpc.whatsapp.getTemplateById.useQuery(useTemplate.getState().plantilla ? useTemplate.getState().plantilla!.name : undefined);
    useEffect(() => {
        if (data?.data[0].components) {
          data.data[0].components.map((component) => {
            if (component.type === 'BODY') {
              setContent(component.text);
            } else if (component.type === 'BUTTONS') {
              component.buttons.forEach((button, index) => {
                if (index === 0) {
                  setButton1(button.text);
                } else if (index === 1) {
                  setButton2(button.text);
                } else if (index === 2) {
                  setButton3(button.text);
                }
              });
            }
          });
        }
    }, [data]);

  const crearTemplate = trpc.whatsapp.createTemplate.useMutation();
  const editTemplate = trpc.whatsapp.editTemplate.useMutation();
  async function handleCreateTemplate() {
    if (type === 'CREATE') {
      await crearTemplate
        .mutateAsync({
          name: name ? name : undefined,
          content: content ? content : undefined,
          buttons: [button1, button2, button3],
        })
        .then(() => {
          toast.success('Plantilla creada correctamente');
          setButton1('');
          setButton2('');
          setButton3('');
          setContent('');
          setName('');
          router.push('/mensajes');
        })
        .catch((error) => {
          toast.error(error.message);
        });
    } else if (type === 'EDIT') {
      await editTemplate
        .mutateAsync({
          metaId: useTemplate.getState().plantilla!.id,
          content: content ? content : '',
          buttons: [button1, button2, button3],
        })
        .then(() => {
          toast.success('Plantilla editada correctamente');
          setButton1('');
          setButton2('');
          setButton3('');
          setContent('');
          setName('');
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
            {type === 'EDIT'
              ? `Edición de la plantilla: ${name}`
               : type === 'CREATE' ? 'Creación de plantilla' : `Vista de la plantilla - ${name}`}
          </h1>
        </div>
        <h3 className='pb-1 font-semibold'>Nombre de la plantilla:</h3>
        <Input
          disabled={type === 'VIEW' || type === 'EDIT'}
          className='mb-3 disabled:opacity-100'
          placeholder='Nombre de la plantilla'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <h3 className='pb-1 font-semibold'>Contenido del mensaje:</h3>
        <textarea
          disabled={type === 'VIEW'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className='min-h-40 w-full disabled:opacity-100'
          placeholder='Cuerpo del mensaje'
        ></textarea>
        <h3 className='pb-1 font-semibold'>Botones del mensaje: (opcional)</h3>
        <div className='flex items-center justify-between pb-3'>
          <Input
            disabled={type === 'VIEW'}
            placeholder='Botón 1'
            className='w-[150px] disabled:opacity-100'
            value={button1}
            onChange={(e) => setButton1(e.target.value)}
          />
          <Input
            disabled={type === 'VIEW'}
            placeholder='Botón 2'
            className='w-[150px] disabled:opacity-100'
            value={button2}
            onChange={(e) => setButton2(e.target.value)}
          />
          <Input
            disabled={type === 'VIEW'}
            placeholder='Botón 3'
            className='w-[150px] disabled:opacity-100'
            value={button3}
            onChange={(e) => setButton3(e.target.value)}
          />
        </div>
        <div className='flex items-center justify-end gap-x-3 pb-3'>
          <Button
            disabled={crearTemplate.isLoading || editTemplate.isLoading || type === 'VIEW'}
            className='flex items-center justify-center gap-x-2'
            onClick={handleCreateTemplate}
          >
            {crearTemplate.isLoading && (
              <svg
                id='loader'
                className='h-6 w-6'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 200 200'
              >
                <radialGradient
                  id='a12'
                  cx='.66'
                  fx='.66'
                  cy='.3125'
                  fy='.3125'
                  gradientTransform='scale(1.5)'
                >
                  <stop offset='0' stopColor='#FFFFFF'></stop>
                  <stop offset='.3' stopColor='#FFFFFF' stopOpacity='.9'></stop>
                  <stop offset='.6' stopColor='#FFFFFF' stopOpacity='.6'></stop>
                  <stop offset='.8' stopColor='#FFFFFF' stopOpacity='.3'></stop>
                  <stop offset='1' stopColor='#FFFFFF' stopOpacity='0'></stop>
                </radialGradient>
                <circle
                  origin='center'
                  fill='none'
                  stroke='url(#a12)'
                  strokeWidth='15'
                  strokeLinecap='round'
                  strokeDasharray='200 1000'
                  strokeDashoffset='0'
                  cx='100'
                  cy='100'
                  r='70'
                >
                  <animateTransform
                    type='rotate'
                    attributeName='transform'
                    calcMode='spline'
                    dur='2'
                    values='360;0'
                    keyTimes='0;1'
                    keySplines='0 0 1 1'
                    repeatCount='indefinite'
                  ></animateTransform>
                </circle>
                <circle
                  origin='center'
                  fill='none'
                  opacity='.2'
                  stroke='#FFFFFF'
                  strokeWidth='15'
                  strokeLinecap='round'
                  cx='100'
                  cy='100'
                  r='70'
                ></circle>
              </svg>
            )}
            <p>{type === 'EDIT' ? 'Editar' : 'Crear'}</p>
          </Button>
        </div>
        {/* <div className="flex justify-between">
                <Input placeholder="Celular" className="w-fit" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                <Button onClick={handleSendMessage}>
                    <p>Enviar mensaje</p>
                </Button>
            </div> */}
      </div>
    </>
  );
};


export default CrearTemplate;
