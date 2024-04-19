'use client'
import { create } from 'zustand';
import ComboBoxPlantillas from './ComboBoxPlantillas';
import { trpc } from '@/lib/trpc';

export const useEnviarTemplate = create<{
  plantilla: string;
  etiquetas: string[];
}>(() => ({
  plantilla: '',
  etiquetas: [],
}));

const EnviarTemplate = () => {
  const { data } = trpc.whatsapp.getTemplates.useQuery();
  return (
    <div>
      <h1>Enviar Template</h1>
      {/* <ComboBoxPlantillas data={data as Array<any>} /> */}
    </div>
  );
};

export default EnviarTemplate;
