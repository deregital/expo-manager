import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { type Table } from '@tanstack/react-table';
interface PaginationProps<TData> {
  table: Table<TData>;
}

const PaginationComp = <TData,>({ table }: PaginationProps<TData>) => {
  const searchParams = new URLSearchParams(useSearchParams());
  const router = useRouter();

  return (
    <>
      <div className='border-t border-black/30 bg-transparent px-5 py-3 text-black'>
        <div className='flex items-center justify-between px-2'>
          <div
            id='buttons-pagination'
            className='flex items-center justify-center gap-x-2 px-2'
          >
            <button
              className='w-8 rounded-md border text-center'
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {'<<'}
            </button>
            <button
              className='w-8 rounded-md border text-center'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {'<'}
            </button>
            <span className='flex items-center gap-1'>
              <div>Page</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount().toLocaleString()}
              </strong>
            </span>
            <button
              className='w-8 rounded-md border text-center'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {'>'}
            </button>
            <button
              className='w-8 rounded-md border text-center'
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              {'>>'}
            </button>
          </div>
          <span className='flex items-center gap-1'>
            | Go to page:
            <input
              type='number'
              value={table.getState().pagination.pageIndex + 1}
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
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default PaginationComp;
