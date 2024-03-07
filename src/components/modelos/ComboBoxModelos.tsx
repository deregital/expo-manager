import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../ui/command';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const ComboBoxModelos = ({
  data,
}: {
  data: RouterOutputs['grupoEtiqueta']['getAll'];
}) => {
  const [open, setOpen] = useState(false);
  const searchParams = new URLSearchParams(useSearchParams());
  const [grupoId, setGrupoId] = useState(searchParams.get('grupoId') ?? '');
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className='text-black' asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[200px] justify-between'
        >
          {grupoId
            ? data.find((grupo) => grupo.id === grupoId)?.nombre
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
                  if (grupo.id === grupoId) {
                    setGrupoId('');
                    searchParams.delete('grupoId');
                    router.push(`${pathname}?${searchParams.toString()}`);
                  } else {
                    setGrupoId(grupo.id);
                    searchParams.set('grupoId', grupo.id);
                    searchParams.delete('etiqueta');
                    router.push(`${pathname}?${searchParams.toString()}`);
                  }
                }}
              >
                {grupo.nombre ? grupo.nombre : 'No hay nombre'}
                <CheckIcon
                  className={cn(
                    'ml-auto h-4 w-4',
                    grupoId === grupo.id ? 'opacity-100' : 'opacity-0'
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

export default ComboBoxModelos;
