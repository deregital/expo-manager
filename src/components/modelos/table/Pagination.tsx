import { type Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
interface PaginationProps<TData> {
  table: Table<TData>;
}

const PaginationComp = <TData,>({ table }: PaginationProps<TData>) => {
  return (
    <>
      <div className='border-t border-black/10 bg-transparent px-5 py-3 text-black'>
        <div className='flex items-center justify-between px-2'>
          <div
            id='buttons-pagination'
            className='flex items-center justify-center gap-x-2 px-2'
          >
            <Button
              className='w-8 rounded-md border p-0 text-center disabled:cursor-not-allowed'
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className='w-6' />
            </Button>
            <Button
              className='w-8 rounded-md border p-0 text-center disabled:cursor-not-allowed'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className='w-6' />
            </Button>
            <span className='flex items-center gap-1'>
              <div>Página</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} de{' '}
                {table.getPageCount().toLocaleString()}
              </strong>
            </span>
            <Button
              className='w-8 rounded-md border px-0 text-center disabled:cursor-not-allowed'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className='w-6' />
            </Button>
            <Button
              className='w-8 rounded-md border px-0 text-center disabled:cursor-not-allowed'
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className='w-6' />
            </Button>
          </div>
          <span className='flex items-center gap-1'>
            Ir a la página:
            <input
              type='number'
              min={1}
              max={table.getPageCount()}
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className='w-14 rounded-md border text-center text-black'
            />
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className='rounded border bg-white/90 p-1'
          >
            {[2, 5, 10, 15, 20].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Mostrar {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default PaginationComp;
