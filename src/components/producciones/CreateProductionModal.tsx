'use client';

import ProductionFillIcon from '@/components/icons/ProductionFillIcon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';

export const CreateProductionModal = () => {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
  const { mutateAsync: createProduction, isLoading } =
    trpc.production.create.useMutation();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className='w-fit rounded-md bg-gray-400 px-5 py-0.5 text-gray-950 hover:bg-gray-300'
          onClick={() => {
            setOpen(true);
          }}
        >
          <span>
            <ProductionFillIcon className='mr-3 h-6 w-6' />
          </span>
          Crear producción
        </Button>
      </DialogTrigger>
      <DialogContent>
        <p className='w-fit py-1.5 text-base font-semibold'>Crear Producción</p>

        <form
          className='flex gap-x-4'
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formElements = form.elements as typeof form.elements & {
              name: { value: string };
            };
            await createProduction({ name: formElements.name.value });
            utils.production.getAll.invalidate();
            setOpen(false);
          }}
        >
          <Input name='name' id='name' />
          <Button disabled={isLoading}>Crear</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
