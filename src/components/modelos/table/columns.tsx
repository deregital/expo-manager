'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RouterOutputs } from '@/server';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

export const columns: ColumnDef<RouterOutputs['modelo']['getAll'][number]>[] = [
  {
    accessorKey: 'idLegible',
    header: ({ column }) => {
      return (
        <div
          className='flex items-center justify-center'
          style={{
            width: `${column.getSize()}px`,
          }}
        >
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            ID
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        </div>
      );
    },
    size: 70,
    cell: ({ row }) => {
      return <p className='w-full text-center'>{row.original.idLegible}</p>;
    },
  },
  {
    accessorKey: 'nombreCompleto',
    header: 'Nombre',
  },
  {
    accessorKey: 'edad',
    header: 'Edad',
  },
  {
    accessorKey: 'genero',
    header: 'Género',
  },
  {
    accessorKey: 'telefono',
    header: 'Teléfono',
  },
  {
    accessorKey: 'etiquetas',
    header: 'Etiquetas',
    cell: ({ row }) => {
      const etiquetas = row.original.etiquetas;

      return (
        <div>
          {etiquetas.map((etiqueta) => (
            <Badge key={etiqueta.id} color='primary' className='mr-1'>
              {etiqueta.nombre}
            </Badge>
          ))}
        </div>
      );
    },
  },
];
