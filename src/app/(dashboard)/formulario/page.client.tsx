'use client';

import { trpc } from '@/lib/trpc';
import { Tabs, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { useQueryState } from 'nuqs';
import { useState } from 'react';
import CreateFormInput from '@/components/formulario/CreateFormInput';
import { useDynamicFormStore as useDynamicFormStore } from '@/components/formulario/dynamicFormStore';
import DynamicFormDisplay from '@/components/formulario/DynamicFormDisplay';

interface FormularioPageClientProps {
  selectedFormId: string;
}

export const FormularioPageClient = ({
  selectedFormId,
}: FormularioPageClientProps) => {
  const { isLoading } = trpc.form.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (useDynamicFormStore.getState().forms.length > 0) return;

      useDynamicFormStore.setState({
        forms: data.map((form) => ({
          ...form,
          type: 'db',
        })),
      });
    },
  });

  const formsStore = useDynamicFormStore();

  const [isCreating, setIsCreating] = useState(false);
  const [inputName, setInputName] = useState('');

  const [tab, setTab] = useQueryState('form', {
    defaultValue: selectedFormId,
  });

  const createForm = () => {
    if (inputName.trim() === '') return;

    const id = crypto.randomUUID();
    formsStore.addForm({
      id,
      name: inputName,
      questions: [],
      type: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    setIsCreating(false);
    setInputName('');
    setTab(id);
  };

  return (
    <div>
      <div className='flex w-full flex-row gap-x-4 px-2'>
        <Tabs
          className='w-full flex-1'
          value={tab ?? undefined}
          onValueChange={(value) => {
            setTab(value);
          }}
        >
          <TabsList>
            {formsStore.forms.length > 0 &&
              !isLoading &&
              formsStore.forms.map((form) => (
                <TabsTrigger key={form.id} value={form.id}>
                  {form.name}
                </TabsTrigger>
              ))}
            {isLoading && (
              <TabsTrigger disabled value='loading'>
                Cargando...
              </TabsTrigger>
            )}
            {formsStore.forms.length === 0 && !isLoading && (
              <TabsTrigger disabled value='empty'>
                No hay formularios, crea uno para empezar
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
        <CreateFormInput
          isCreating={isCreating}
          setIsCreating={setIsCreating}
          name={inputName}
          setName={setInputName}
          onSubmit={createForm}
        />
      </div>
      <DynamicFormDisplay
        form={formsStore.forms.find((form) => form.id === tab) ?? null}
      />
    </div>
  );
};
