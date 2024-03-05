import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModalData } from './EtiquetaModal';
import { RouterOutputs } from '@/server';

const ComboBox = ({
  data,
}: {
  data: RouterOutputs['grupoEtiqueta']['getAll'];
}) => {
  const modalData = useModalData((state) => ({
    tipo: state.tipo,
    nombre: state.nombre,
    grupoId: state.grupoId,
  }));
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className='text-black' asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[200px] justify-between'
        >
          {modalData.grupoId
            ? data.find((grupo) => grupo.id === modalData.grupoId)?.nombre
            : 'Buscar grupo...'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0'>
        <Command>
          <CommandInput placeholder='Buscar grupo...' className='h-9' />
          <CommandEmpty>Grupo no encontrado.</CommandEmpty>
          <CommandGroup>
            {data.map((grupo) => (
              <CommandItem
                className='cursor-pointer hover:bg-gray-100'
                key={grupo.id}
                value={grupo.nombre}
                onSelect={() => {
                  setOpen(false);
                  useModalData.setState({
                    grupoId: grupo.id,
                  });
                }}
              >
                {grupo.nombre ? grupo.nombre : 'No hay nombre'}
                <CheckIcon
                  className={cn(
                    'ml-auto h-4 w-4',
                    modalData.grupoId === grupo.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboBox;
