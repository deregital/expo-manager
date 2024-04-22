'use client';
import { create } from 'zustand';
import { trpc } from '@/lib/trpc';
import ComboBox from '../ui/ComboBox';
import { useMemo, useState } from 'react';
import TemplateIcon from '../icons/TemplateIcon';

export const useEnviarTemplate = create<{
  plantilla: string;
  etiquetas: string[];
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
  const [open, setOpen] = useState(false);

  const currentPlantilla = useMemo(() => {
    return data?.data.find((plantilla) => plantilla.id === templateData.plantilla)?.name;
  }, [data, templateData.plantilla]);

  return (
    <div className='p-5'>
      <ComboBox 
        data={data?.data ? data.data : []}
        id={'id'}
        value={'name'}
        open={open}
        setOpen={setOpen}
        triggerChildren={
          <>
            <span className='max-w-[calc(100%-30px)] truncate'>
              {templateData.plantilla ? currentPlantilla : 'Buscar plantilla...'}
            </span>
            <TemplateIcon className='h-5 w-5' />
          </>
        }
        onSelect={(id) => {
          useEnviarTemplate.setState({
            plantilla: id,
          });
          setOpen(false);
        }}
        selectedIf={templateData.plantilla}
        wFullMobile 
        />
    </div>
  );
};

export default EnviarTemplate;
