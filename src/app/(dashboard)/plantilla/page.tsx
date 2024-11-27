'use client';
import DeleteTemplateModal, {
  useTemplateDelete,
} from '@/components/mensajes/DeleteTemplateModal';
import SendTemplate from '@/components/mensajes/SendTemplate';
import TemplatesList from '@/components/mensajes/TemplatesList';
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
      <TemplatesList />
      <SendTemplate />
      <DeleteTemplateModal open={open} template={template} />
      <SendTemplateModal />
    </div>
  );
};

export default MessagesPage;
