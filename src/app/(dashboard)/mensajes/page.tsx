'use client';
import DeleteTemplateModal, {
  useTemplateDelete,
} from '@/components/mensajes/DeleteTemplateModal';
import EnviarTemplate from '@/components/mensajes/EnviarTemplate';
import PlantillasList from '@/components/mensajes/PlantillasList';
import { RouterOutputs } from '@/server';
import React, { useState } from 'react';

const MensajesPage = () => {
  const [open, setOpen] = useState(false);
  const [plantilla, setPlantilla] = useState<
    RouterOutputs['whatsapp']['getTemplateById'] | null
  >(null);
  useTemplateDelete.subscribe(({ open, plantilla }) => {
    setOpen(open);
    setPlantilla(plantilla);
  });
  return (
    <div>
      <PlantillasList />
      <EnviarTemplate />
      <DeleteTemplateModal open={open} plantilla={plantilla} />
    </div>
  );
};

export default MensajesPage;
