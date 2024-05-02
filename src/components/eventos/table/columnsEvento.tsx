'use client';

import { Button } from '@/components/ui/button';
import { RouterOutputs } from '@/server';
import { ColumnDef, SortDirection } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import CellComponent from './CellComponent';

export function generateColumns(id: string) {
    const columns: ColumnDef<RouterOutputs['modelo']['getAll'][number]>[] = [
        {
          accessorKey: 'idLegible',
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
                  onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
          accessorKey: 'Confirmó asistencia',
          cell: ({ row }) => <CellComponent row={row} confirmoAsistenciaId={id}/>,
          header: () => {
            return (
            <div className='flex justify-center items-center'>
              <p
                className='pl-0'
              >
                Confirmó asistencia
              </p>
              </div>
            );
          },
        },
      ];
    return columns
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
