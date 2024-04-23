'use client';
import { create } from 'zustand';
import { trpc } from '@/lib/trpc';
import ComboBox from '../ui/ComboBox';
import { useMemo, useState } from 'react';
import TemplateIcon from '../icons/TemplateIcon';
import EtiquetaFillIcon from '../icons/EtiquetaFillIcon';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Circle } from 'lucide-react';
import CircleXIcon from '../icons/CircleX';

interface EtiquetasProps {
  id: string;
  name: string;
}

const precioTemplate = {
  'MARKETING': 0.0618,
  'UTILITY': 0.0408,
  'AUTHENTICATION': 0.0367,
}

export const useEnviarTemplate = create<{
  plantilla: string;
  etiquetas: EtiquetasProps[];
}>(() => ({
  plantilla: '',
  etiquetas: [],
}));

const EnviarTemplate = () => {
  const templateData = useEnviarTemplate((state) => ({
    plantilla: state.plantilla,
    etiquetas: state.etiquetas,
  }));
  const { data } = trpc.whatsapp.getTemplates.useQuery();
  const { data: etiquetas } = trpc.etiqueta.getAll.useQuery();
  const {data: modelos } = trpc.modelo.getByEtiqueta.useQuery(templateData.etiquetas.map((et) => et.id))
  const { data: Template } = trpc.whatsapp.getTemplateById.useQuery(templateData.plantilla, {
    enabled: templateData.plantilla !== '',
  });
  const sendMessage = trpc.whatsapp.sendMessageToEtiqueta.useMutation();

  const [openPlantilla, setOpenPlantilla] = useState(false);
  const [openEtiqueta, setOpenEtiqueta] = useState(false);

  const currentPlantilla = useMemo(() => {
    return data?.data.find((plantilla) => plantilla.id === templateData.plantilla)?.name;
  }, [data, templateData.plantilla]);

  const currentPrecio = useMemo(() => {
    if (templateData.plantilla === '') return 0;
    // console.log(Template?.data[0].category ? Template?.data[0].category : 'MARKETING')
    // console.log(Template?.data[0].category as keyof typeof precioTemplate)
    // return (precioTemplate[Template?.data[0].category as keyof typeof precioTemplate])*(modelos ? modelos.length : 0);
    return (0.0618)*(modelos ? modelos.length : 0)
  }, [modelos, templateData.plantilla]);

  async function handleSubmit() {
    if (templateData.plantilla === '') {
      toast.error('Por favor seleccione una plantilla');
      return;
    }
    if (templateData.etiquetas.length === 0) {
      toast.error('Por favor seleccione al menos una etiqueta');
      return;
    }
    // const res = await sendMessage.mutateAsync({
    //   plantillaName: templateData.plantilla,
    //   etiquetas: templateData.etiquetas.map((et) => et.id),
    // })
    // if (res === 'Mensajes enviados') {
    //   toast.success('Plantilla enviada correctamente');
    //   useEnviarTemplate.setState({
    //     plantilla: '',
    //     etiquetas: [],
    //   });
    //   return
    // } else {
    //   toast.error('Error al enviar la plantilla a las etiquetas seleccionadas');
    //   return
    // }
    toast.success('Plantilla enviada correctamente');
      useEnviarTemplate.setState({
        plantilla: '',
        etiquetas: [],
      });
  }

  return (
    <>
    <div className='p-5 flex justify-around items-start'>
      <div>
      <ComboBox 
        data={data?.data ? data.data : []}
        id={'id'}
        value={'name'}
        open={openPlantilla}
        setOpen={setOpenPlantilla}
        triggerChildren={
          <>
            <span className='max-w-[calc(100%-30px)] truncate'>
              {templateData.plantilla !== '' ? currentPlantilla : 'Buscar plantilla...'}
            </span>
            <TemplateIcon className='h-5 w-5' />
          </>
        }
        onSelect={(id) => {
          if (templateData.plantilla === id) {
            useEnviarTemplate.setState({
              plantilla: '',
            });
            setOpenPlantilla(false);
            return;
          }
          useEnviarTemplate.setState({
            plantilla: id,
          });
          setOpenPlantilla(false);
        }}
        selectedIf={templateData.plantilla}
        wFullMobile 
        />
      </div>
      <div className='flex flex-col gap-y-3'>
      <ComboBox
          data={etiquetas ? etiquetas : []}
          id={'id'}
          value={'nombre'}
          open={openEtiqueta}
          setOpen={setOpenEtiqueta}
          triggerChildren={
            <>
              <span className='max-w-[calc(100%-30px)] truncate'>
                {templateData.etiquetas.length > 0 ? 'Buscar etiqueta...' : 'Buscar etiqueta...'}
              </span>
              <EtiquetaFillIcon className='h-5 w-5' />
            </>
          }
          onSelect={(id) => {
            if (templateData.etiquetas.find((et) => et.id === id)) {
              toast.error('La etiqueta ya ha sido seleccionada');
              setOpenEtiqueta(false);
              return
            }
            useEnviarTemplate.setState({
              etiquetas: [...templateData.etiquetas, { id, name: etiquetas?.find((et) => et.id === id)?.nombre ?? ''}],
            });
            setOpenEtiqueta(false);
            toast.success('Etiqueta agregada correctamente');
          }}
          selectedIf={''}
          wFullMobile
        />
        {templateData.etiquetas.map((etiqueta) => (
          <div key={etiqueta.id} className='flex justify-between items-center gap-x-2 bg-red-500 px-2 py-0.5 rounded-full w-fit'>
            <span className='text-sm'>{etiqueta.name}</span>
              <CircleXIcon 
                onClick={() => {
                  useEnviarTemplate.setState({
                    etiquetas: templateData.etiquetas.filter((et) => et.id !== etiqueta.id),
                  });
                }} 
                className='h-4 w-4 text-white hover:cursor-pointer' 
              />
            </div>
        ))}
      </div>
    </div>
    <div className='flex justify-around items-center'>
          <div className=''>
            <span>{modelos?.length} modelos encontradas</span>
          </div>
          <div>
            <span>${currentPrecio} precio estimado</span>
          </div>
          <Button onClick={handleSubmit} className='bg-black/70 text-white px-3 py-1.5 rounded-md'>Enviar</Button>
    </div>
    </>
  );
};

export default EnviarTemplate;
