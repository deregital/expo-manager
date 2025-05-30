'use client';

import { Button } from '@/components/ui/button';
import { type RouterOutputs } from '@/server';
import { type ColumnDef, type SortDirection } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import CellPresentismo from './CellPresentismo';

export function generateColumnsPresentismo({
  asistenciaId,
  confirmoId,
}: {
  asistenciaId: string;
  confirmoId: string;
}) {
  const columns: ColumnDef<RouterOutputs['profile']['getByTags'][number]>[] = [
    {
      accessorKey: 'shortId',
      header: ({ column }) => {
        return (
          <div
            className='mx-auto w-full'
            style={{
              width: `${column.getSize()}px`,
            }}
          >
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
        const date = new Date(row.original.created_at).toLocaleDateString(
          undefined,
          {
            localeMatcher: 'best fit',
          }
        );

        const month = date.split('/')[0];
        const day = date.split('/')[1];
        const year = date.split('/')[2];
        return <p>{`${day}/${month}/${year}`}</p>;
      },
    },
    {
      accessorKey: '¿Vino?',
      cell: ({ row }) => (
        <CellPresentismo
          row={row}
          confirmedId={confirmoId}
          assistedId={asistenciaId}
        />
      ),
      sortingFn: (rowA, rowB) => {
        // This is a custom sorting function that sorts rows that contain id in etiquetas first
        const a = rowA.original.tags.map((tag) => tag.id);
        const b = rowB.original.tags.map((tag) => tag.id);

        const hasTagA = a.includes(asistenciaId);
        const hasTagB = b.includes(asistenciaId);

        if (hasTagA && !hasTagB) return -1;
        if (!hasTagA && hasTagB) return 1;
        return 0;
      },
      header: ({ column }) => {
        return (
          <div className='flex justify-center'>
            <Button
              variant='ghost'
              className='pl-0'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              ¿Vino?
              <SortingIcon isSorted={column.getIsSorted()} />
            </Button>
          </div>
        );
      },
    },
  ];
  return columns;
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
