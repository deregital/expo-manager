'use client';
import * as React from 'react';
import {
  ColumnDef,
  SortingState,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PaginationComp from './Pagination';
import Loader from '@/components/ui/loader';

interface DataTableProps<TData extends { id: string }, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
}

export const DataTable = <TData extends { id: string }, TValue>({
  columns,
  data,
  isLoading,
}: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const router = useRouter();

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination,
    },
    defaultColumn: {
      size: 200, //starting column size
      minSize: 10, //enforced during column resizing
      maxSize: 500, //enforced during column resizing
    },
  });

  function goToModel(id: string) {
    router.push(`/modelo/${id}`);
  }

  return (
    <div className='rounded-md border'>
      <Table className='bg-white'>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className='[&_tr:last-child]:border-0'>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className='py-3'>
                <div className='mx-auto w-fit'>
                  <Loader />
                </div>
              </td>
            </tr>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, idx) => (
              <TableRow
                onClick={() => goToModel(row.original.id)}
                className={cn(
                  'cursor-pointer',
                  idx % 2 === 0
                    ? 'bg-gray-200 hover:bg-gray-300'
                    : 'hover:bg-gray-200/60'
                )}
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No se encontraron resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <PaginationComp table={table} />
    </div>
  );
};
