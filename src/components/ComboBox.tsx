import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './ui/command';
import { GrupoEtiqueta } from '@/server/types/whatsapp';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModalData } from './EtiquetaModal';

export default function ComboBox({ data }: { data: GrupoEtiqueta[] }) {
  const tipo = useModalData((state) => state.tipo);
  const grupoId = useModalData((state) => state.grupoId);
  const nombre = useModalData((state) => state.nombre);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(tipo === 'CREATE' ? '' : grupoId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="text-black" asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? data.find((grupo) => grupo.id === value)?.nombre
            : 'Buscar grupo...'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Buscar grupo..." className="h-9" />
          <CommandEmpty>Grupo no encontrado.</CommandEmpty>
          <CommandGroup>
            {data.map((grupo) => (
              <CommandItem
                className=""
                key={grupo.id}
                value={grupo.nombre}
                onSelect={() => {
                  setValue(grupo.id === value ? '' : grupo.id);
                  setOpen(false);
                  useModalData.setState({
                    grupoId: grupo.id,
                    nombre: grupo.nombre,
                  });
                }}
              >
                {grupo.nombre ? grupo.nombre : 'No hay nombre'}
                <CheckIcon
                  className={cn(
                    'ml-auto h-4 w-4',
                    value === grupo.nombre ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
