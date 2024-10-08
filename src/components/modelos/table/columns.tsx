'use client';

import { edadFromFechaNacimiento } from '@/components/modelo/ModeloEditModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTextColorByBg } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import { TipoEtiqueta } from '@prisma/client';
import { ColumnDef, SortDirection } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export function generateColumns(
  showEventos: boolean
): ColumnDef<RouterOutputs['modelo']['getAll'][number]>[] {
  return [
    {
      accessorKey: 'idLegible',
      header: ({ column }) => {
        return (
          <div className='mx-auto w-14'>
            <Button
              className='px-1'
              variant='ghost'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              ID
              <SortingIcon isSorted={column.getIsSorted()} />
            </Button>
          </div>
        );
      },
      minSize: 50,
      size: 50,
      maxSize: 50,
      enableResizing: false,
      cell: ({ row }) => {
        return <p className='w-full text-center'>{row.original.idLegible}</p>;
      },
    },
    {
      accessorKey: 'nombreCompleto',
      sortingFn: (rowA, rowB, dir) => {
        return (
          rowA.original.nombreCompleto.localeCompare(
            rowB.original.nombreCompleto
          ) * (dir === 'asc' ? -1 : 1)
        );
      },
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            className='pl-0'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nombre
            <SortingIcon isSorted={column.getIsSorted()} />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <p className='w-40 truncate'>{row.original.nombreCompleto}</p>;
      },
    },
    {
      accessorKey: 'edad',
      header: 'Edad',
      size: 50,
      minSize: 50,
      maxSize: 50,
      cell: ({ row }) => {
        if (row.original.fechaNacimiento === null) return <></>;
        const edad = edadFromFechaNacimiento(row.original.fechaNacimiento);
        return <p className='whitespace-nowrap'>{`${edad} años`}</p>;
      },
    },
    {
      accessorKey: 'genero',
      header: 'Género',
      size: 100,
      minSize: 100,
      maxSize: 100,
    },
    {
      accessorKey: 'telefono',
      header: 'Teléfono',
      size: 150,
      minSize: 150,
      maxSize: 150,
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            className='pl-0'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Creado el
            <SortingIcon isSorted={column.getIsSorted()} />
          </Button>
        );
      },
      size: 100,
      minSize: 100,
      maxSize: 100,
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);

        const formattedDate = date.toLocaleDateString(undefined, {
          localeMatcher: 'best fit',
        });

        const formattedTime = date.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        });

        const month = formattedDate.split('/')[0];
        const day = formattedDate.split('/')[1];
        const year = formattedDate.split('/')[2];
        return <p>{`${day}/${month}/${year} ${formattedTime}`}</p>;
      },
    },
    {
      accessorKey: 'etiquetas',
      header: 'Etiquetas',
      cell: ({ row }) => {
        const etiquetas = row.original.etiquetas;

        return (
          <div className='flex flex-1'>
            {etiquetas
              .filter(
                (etiqueta) =>
                  showEventos || etiqueta.tipo !== TipoEtiqueta.EVENTO
              )
              .sort((a, b) => {
                if (
                  a.tipo === TipoEtiqueta.PERSONAL &&
                  b.tipo !== TipoEtiqueta.PERSONAL
                ) {
                  return -1;
                } else if (
                  a.tipo !== TipoEtiqueta.PERSONAL &&
                  b.tipo === TipoEtiqueta.PERSONAL
                ) {
                  return 1;
                } else {
                  return 0;
                }
              })
              .map((etiqueta) => (
                <Badge
                  key={etiqueta.id}
                  style={{
                    backgroundColor: etiqueta.grupo.color,
                    color: getTextColorByBg(etiqueta.grupo.color),
                  }}
                  className='mr-1 max-w-24'
                >
                  <span className='truncate'>{etiqueta.nombre}</span>
                </Badge>
              ))}
          </div>
        );
      },
    },
  ];
}

type SortingIconProps = {
  isSorted: false | SortDirection;
};

const SortingIcon = ({ isSorted }: SortingIconProps) => {
  return isSorted ? (
    {
      asc: <ArrowDown className='ml-2 h-4 w-4 transform' />,
      desc: <ArrowUp className='ml-2 h-4 w-4' />,
    }[isSorted === 'desc' ? 'desc' : 'asc']
  ) : (
    <ArrowUpDown className='ml-2 h-4 w-4' />
  );
};
