'use client';
import DeleteTemplateModal, {
  useTemplateDelete,
} from '@/components/mensajes/DeleteTemplateModal';
import EnviarTemplate from '@/components/mensajes/EnviarTemplate';
import PlantillasList from '@/components/mensajes/PlantillasList';
import SendTemplateModal from '@/components/mensajes/SendTemplateModal';
import { type GetTemplatesData } from '@/server/types/whatsapp';
import React, { useState } from 'react';

const MessagesPage = () => {
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<GetTemplatesData | null>(null);
  useTemplateDelete.subscribe(({ open, template }) => {
    setOpen(open);
    setTemplate(template);
  });
  return (
    <div className='px-2'>
      <PlantillasList />
      <EnviarTemplate />
      <DeleteTemplateModal open={open} template={template} />
      <SendTemplateModal />
    </div>
  );
};

export default MessagesPage;
