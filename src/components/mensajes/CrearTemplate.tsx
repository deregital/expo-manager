'use client';
import { use, useState } from 'react';
import { Input } from '../ui/input';
import { trpc } from '@/lib/trpc';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { create } from 'zustand';
import { RouterOutputs } from '@/server';
import { useRouter } from 'next/navigation';

export const useTemplate = create<{
  type: string;
  plantilla: RouterOutputs['whatsapp']['getTemplateById'];
}>((set) => ({
  type: '',
  plantilla: null,
}));

const CrearTemplate = () => {
  const [type, setType] = useState<string>(useTemplate.getState().type);
  const [button1, setButton1] = useState<string>('');
  const [button2, setButton2] = useState<string>('');
  const [button3, setButton3] = useState<string>('');
  const [content, setContent] = useState<string | undefined>(
    useTemplate.getState().plantilla?.contenido?.['components']
  );
  const [name, setName] = useState<string | undefined>(
    useTemplate.getState().plantilla?.titulo
  );
  const router = useRouter();
  console.log(useTemplate.getState().plantilla?.contenido);
  useTemplate.subscribe(({ type, plantilla }) => {
    setType(type);
    if (plantilla) {
      // setButton1(plantilla.buttons[0])
      // setButton2(plantilla.buttons[1])
      // setButton3(plantilla.buttons[2])
      // setContent(plantilla.content)
      setName(plantilla.titulo);
      console.log(name);
    }
  });
  const crearTemplate = trpc.whatsapp.createTemplate.useMutation();
  const editTemplate = trpc.whatsapp.editTemplate.useMutation();
  const sendMessageUniquePhone =
    trpc.whatsapp.sendMessageUniquePhone.useMutation();
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
    } else {
      await editTemplate
        .mutateAsync({
          id: useTemplate.getState().plantilla!.id,
          metaId: useTemplate.getState().plantilla!.metaId,
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
              : 'Creación de plantilla'}
          </h1>
        </div>
        <h3 className='pb-1 font-semibold'>Nombre de la plantilla:</h3>
        <Input
          className='mb-3'
          placeholder='Nombre de la plantilla'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <h3 className='pb-1 font-semibold'>Contenido del mensaje:</h3>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className='min-h-40 w-full'
          placeholder='Cuerpo del mensaje'
        ></textarea>
        <h3 className='pb-1 font-semibold'>Botones del mensaje: (opcional)</h3>
        <div className='flex items-center justify-between pb-3'>
          <Input
            placeholder='Botón 1'
            className='w-[150px]'
            value={button1}
            onChange={(e) => setButton1(e.target.value)}
          />
          <Input
            placeholder='Botón 2'
            className='w-[150px]'
            value={button2}
            onChange={(e) => setButton2(e.target.value)}
          />
          <Input
            placeholder='Botón 3'
            className='w-[150px]'
            value={button3}
            onChange={(e) => setButton3(e.target.value)}
          />
        </div>
        <div className='flex items-center justify-end gap-x-3 pb-3'>
          <Button
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
