'use client';

import { trpc } from '@/lib/trpc';
import { Tabs, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { useQueryState } from 'nuqs';
import { useState } from 'react';
import CreateFormInput from '@/components/formulario/CreateFormInput';

interface FormularioPageClientProps {
  selectedFormId: string;
}

export const FormularioPageClient = ({
  selectedFormId,
}: FormularioPageClientProps) => {
  const [forms] = trpc.form.getAll.useSuspenseQuery();
  const selectedForm = forms.find((form) => form.id === selectedFormId);

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');

  const [tab, setTab] = useQueryState('form', {
    defaultValue: selectedFormId,
  });

  const createForm = () => {
    if (name.trim() === '') return;

    const id = crypto.randomUUID();
    forms.push({
      id,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: [],
    });

    setIsCreating(false);
    setName('');
    setTab(id);
  };

  return (
    <div className='flex w-full flex-row gap-x-4 px-2'>
      <Tabs
        className='w-full flex-1'
        value={tab ?? undefined}
        onValueChange={(value) => {
          setTab(value);
        }}
      >
        <TabsList>
          {forms.map((form) => (
            <TabsTrigger key={form.id} value={form.id}>
              {form.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <CreateFormInput
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        name={name}
        setName={setName}
        onSubmit={createForm}
      />
    </div>
  );
};
