'use client'
import CrearTemplate from '@/components/mensajes/CrearTemplate';
import DeleteTemplateModal from '@/components/mensajes/DeleteTemplateModal';
import PlantillasList from '@/components/mensajes/PlantillasList';
import { RouterOutputs } from '@/server';
import React, { useState } from 'react';
import { create } from 'zustand';

export const useTemplateDelete = create<{open: boolean; plantilla: RouterOutputs['whatsapp']['getTemplateById']}>((set) => ({
  open: false,
  plantilla: null,
}));

const MensajesPage = () => {
  const [open, setOpen] = useState(false);
  const [plantilla, setPlantilla] = useState<RouterOutputs['whatsapp']['getTemplateById'] | null>(null);
  useTemplateDelete.subscribe(({open, plantilla}) => {
    setOpen(open);
    setPlantilla(plantilla);
  });
  return (
    <div>
      <PlantillasList />
      <CrearTemplate />
      <DeleteTemplateModal open={open} plantilla={plantilla} />
    </div>
  );
};

export default MensajesPage;
