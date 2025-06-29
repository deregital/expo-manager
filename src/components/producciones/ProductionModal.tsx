'use client';

import ProductionFillIcon from '@/components/icons/ProductionFillIcon';
import { Button } from '@/components/ui/button';
import ComboBox from '@/components/ui/ComboBox';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { type Profile } from 'expo-backend-types';
import { Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { create } from 'zustand';
import { Textarea } from '../ui/textarea';

export const useProductionModalStore = create<{
  name: string;
  producerId: Profile['id'] | null;
  description: string;
  reset: () => void;
}>((set) => ({
  name: '',
  producerId: null,
  description: '',
  reset: () => set({ name: '', producerId: null, description: '' }),
}));

type ProductionModalProps =
  | {
      mode: 'create';
      productionName?: never;
      productionId?: never;
      producerId?: never;
      productionDescription?: never;
    }
  | {
      mode: 'edit';
      productionName: string;
      productionId: string;
      producerId: Profile['id'];
      productionDescription: string;
    };

export const ProductionModal = ({
  mode,
  producerId,
  productionId,
  productionName,
  productionDescription,
}: ProductionModalProps) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comboBoxOpen, setComboBoxOpen] = useState(false);
  const {
    reset,
    producerId: selectedProducerId,
    name,
    description,
  } = useProductionModalStore();
  const { data: participants } = trpc.profile.getAll.useQuery();
  const utils = trpc.useUtils();
  const { mutateAsync: createProduction, isLoading: isLoadingCreate } =
    trpc.production.create.useMutation();

  const { mutateAsync: editProduction, isLoading: isLoadingUpdate } =
    trpc.production.edit.useMutation({
      onSuccess: () => {
        utils.production.getAll.invalidate();
        setOpen(false);
      },
    });

  const selectedProducer = useMemo(() => {
    return participants?.find((p) => p.id === selectedProducerId);
  }, [participants, selectedProducerId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedProducer) {
      setError('Seleccione un productor');
      return;
    }

    if (mode === 'create') {
      await createProduction({
        name,
        description,
        administratorId: selectedProducer.id,
      });
    } else {
      await editProduction({
        id: productionId!,
        name,
        administratorId: selectedProducer.id,
        description,
      });
    }

    utils.production.getAll.invalidate();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          reset();
        }
      }}
    >
      <DialogTrigger asChild>
        {mode === 'edit' ? (
          <Button
            variant={'ghost'}
            className='h-fit rounded-md p-1 text-gray-950 hover:bg-black/10'
            onClick={() => {
              useProductionModalStore.setState({
                name: productionName ?? '',
                producerId: producerId ?? null,
                description: productionDescription ?? '',
              });
              setOpen(true);
            }}
          >
            <Pencil className='size-4' />
          </Button>
        ) : (
          <Button
            className='w-fit rounded-md bg-gray-400 px-5 py-0.5 text-gray-950 hover:bg-gray-300'
            onClick={() => {
              useProductionModalStore.setState({
                name: '',
                producerId: null,
                description: '',
              });
              setOpen(true);
            }}
          >
            <span>
              <ProductionFillIcon className='mr-3 h-6 w-6' />
            </span>
            Crear producción
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <p className='w-fit py-1.5 text-base font-semibold'>Crear Producción</p>

        <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
          <Label htmlFor='name' className='w-fit'>
            Nombre
          </Label>
          <Input
            name='name'
            value={name}
            id='name'
            placeholder='MaBel'
            onChange={(e) => {
              useProductionModalStore.setState({
                name: e.target.value,
              });
            }}
          />
          <Label htmlFor='description' className='w-fit'>
            Descripción
          </Label>
          <Textarea
            className='max-h-40 resize-y'
            name='description'
            value={description}
            id='description'
            placeholder='Descripción'
            onChange={(e) => {
              useProductionModalStore.setState({
                description: e.target.value,
              });
            }}
          />
          <Label htmlFor='producer'>Productor</Label>
          <ComboBox
            data={participants ?? []}
            id='id'
            onSelect={(value) => {
              const selected = participants?.find((p) => p.id === value);

              useProductionModalStore.setState({
                producerId: selected?.id ?? null,
              });
            }}
            isLoading={!participants}
            notFoundText='No se encontraron resultados'
            placeholder='Buscar productor'
            open={comboBoxOpen}
            setOpen={setComboBoxOpen}
            selectedIf={selectedProducer?.id ?? ''}
            buttonClassName='w-full'
            contentClassName='sm:max-w-[var(--radix-popper-anchor-width)] w-[var(--radix-popper-anchor-width)]'
            value={(item) =>
              `${item.fullName}${item.dni ? ` - ${item.dni}` : ''}`
            }
            triggerChildren={
              selectedProducer ? (
                <span className='text-gray-950'>
                  {selectedProducer.fullName} - {selectedProducer.dni}
                </span>
              ) : (
                <span className='text-gray-400'>Seleccionar productor</span>
              )
            }
          />
          {error && <p className='text-sm font-bold text-red-500'>{error}</p>}
          <Button disabled={isLoadingCreate || isLoadingUpdate} type='submit'>
            {mode === 'create' ? 'Crear' : 'Actualizar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
