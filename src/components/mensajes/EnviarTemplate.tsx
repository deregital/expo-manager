'use client';
import { create } from 'zustand';
import { trpc } from '@/lib/trpc';
import ComboBox from '../ui/ComboBox';
import { useMemo, useState } from 'react';
import TemplateIcon from '../icons/TemplateIcon';
import EtiquetaFillIcon from '../icons/EtiquetaFillIcon';
import { toast } from 'sonner';

interface EtiquetasProps {
  id: string;
  name: string;
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
  const [openPlantilla, setOpenPlantilla] = useState(false);
  const [openEtiqueta, setOpenEtiqueta] = useState(false);

  const currentPlantilla = useMemo(() => {
    return data?.data.find((plantilla) => plantilla.id === templateData.plantilla)?.name;
  }, [data, templateData.plantilla]);

  return (
    <div className='p-5'>
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
        {templateData.etiquetas.map((etiqueta) => (
          <div key={etiqueta.id} className='flex justify-between items-center'>
            <span>{etiqueta.name}</span>
            <button
              onClick={() => {
                useEnviarTemplate.setState({
                  etiquetas: templateData.etiquetas.filter((et) => et.id !== etiqueta.id),
                });
              }}
              className='p-1 text-red-500'
            >
              Eliminar
            </button>
            </div>
        ))}
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
        <span>{modelos?.length} modelos encontradas</span>
    </div>
  );
};

export default EnviarTemplate;
