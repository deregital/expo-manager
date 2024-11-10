'use client';

import { ageFromBirthDate } from '@/components/modelo/ModeloEditModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTextColorByBg } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import { ColumnDef, SortDirection } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export function generateColumns(
  showEventos: boolean
): ColumnDef<RouterOutputs['modelo']['getAll'][number]>[] {
  return [
    {
      accessorKey: 'shortId',
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
        return <p className='w-full text-center'>{row.original.shortId}</p>;
      },
    },
    {
      accessorKey: 'fullName',
      sortingFn: (rowA, rowB, dir) => {
        return (
          rowA.original.fullName.localeCompare(rowB.original.fullName) *
          (dir === 'asc' ? -1 : 1)
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
        return <p className='w-40 truncate'>{row.original.fullName}</p>;
      },
    },
    {
      accessorKey: 'edad',
      header: 'Edad',
      size: 50,
      minSize: 50,
      maxSize: 50,
      cell: ({ row }) => {
        if (row.original.birthDate === null) return <></>;
        const edad = ageFromBirthDate(row.original.birthDate);
        return <p className='whitespace-nowrap'>{`${edad} años`}</p>;
      },
    },
    {
      accessorKey: 'gender',
      header: 'Género',
      size: 100,
      minSize: 100,
      maxSize: 100,
    },
    {
      accessorKey: 'phoneNumber',
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
      accessorKey: 'tags',
      header: 'Etiquetas',
      cell: ({ row }) => {
        const tags = row.original.tags;

        return (
          <div className='flex flex-1'>
            {tags
              .filter((etiqueta) => showEventos || etiqueta.type !== 'EVENT')
              .sort((a, b) => {
                if (a.type === 'PROFILE' && b.type !== 'PROFILE') {
                  return -1;
                } else if (a.type !== 'PROFILE' && b.type === 'PROFILE') {
                  return 1;
                } else {
                  return 0;
                }
              })
              .map((tag) => (
                <Badge
                  key={tag.id}
                  style={{
                    backgroundColor: tag.group.color,
                    color: getTextColorByBg(tag.group.color),
                  }}
                  className='mr-1 max-w-24'
                >
                  <span className='truncate'>{tag.name}</span>
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
