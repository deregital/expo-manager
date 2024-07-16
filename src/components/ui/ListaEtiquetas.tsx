import CirclePlus from '@/components/icons/CirclePlus';
import CircleXIcon from '@/components/icons/CircleX';
import { Badge } from '@/components/ui/badge';
import { getTextColorByBg } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import React from 'react';

interface ListaEtiquetasProps {
  etiquetas: NonNullable<RouterOutputs['modelo']['getById']>['etiquetas'];
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  handleDelete: (
    etiqueta: NonNullable<
      RouterOutputs['modelo']['getById']
    >['etiquetas'][number]
  ) => void;
}

const ListaEtiquetas = ({
  etiquetas,
  children,
  open,
  setOpen,
  handleDelete,
}: ListaEtiquetasProps) => {
  return (
    <div className='w-full'>
      <div className='flex flex-wrap items-center gap-2'>
        {etiquetas?.map((etiqueta) => (
          <Badge
            className='group whitespace-nowrap transition-transform duration-200 ease-in-out hover:shadow-md'
            style={{
              backgroundColor: etiqueta.grupo.color,
              color: getTextColorByBg(etiqueta.grupo.color),
            }}
            key={etiqueta.id}
          >
            {etiqueta.nombre}

            <CircleXIcon
              onClick={() => handleDelete(etiqueta)}
              className='invisible w-0 cursor-pointer group-hover:visible group-hover:ml-1 group-hover:w-4'
              width={16}
              height={16}
            />
          </Badge>
        ))}
        {!open ? (
          <CirclePlus
            className='h-5 w-5 cursor-pointer'
            onClick={() => setOpen(true)}
          />
        ) : (
          <CircleXIcon
            className='h-5 w-5 cursor-pointer'
            onClick={() => setOpen(false)}
          />
        )}
      </div>

      {open && children}
    </div>
  );
};

export default ListaEtiquetas;
