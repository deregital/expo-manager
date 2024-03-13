'use client';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { MouseEvent } from 'react';

interface PaginationProps {
  count: number;
}
const PaginationComp = ({ count }: PaginationProps) => {
  const searchParams = new URLSearchParams(useSearchParams());
  const router = useRouter();
  function ChangePagination(
    pagination: number,
    e: MouseEvent<HTMLButtonElement>
  ) {
    e.preventDefault();
    if (pagination === 1) {
      searchParams.delete('pagination');
    } else {
      searchParams.set('pagination', pagination.toString());
    }
    router.push(`/modelos?${searchParams.toString()}`);
  }
  function PreviousPagination(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (Number(searchParams.get('pagination')) === 2) {
      searchParams.delete('pagination');
    } else {
      searchParams.set(
        'pagination',
        (Number(searchParams.get('pagination')) - 1).toString()
      );
      router.push(`/modelos?${searchParams.toString()}`);
    }
  }
  function NextPagination(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!searchParams.get('pagination')) {
      searchParams.set('pagination', '2');
    } else {
      searchParams.set(
        'pagination',
        (Number(searchParams.get('pagination')) + 1).toString()
      );
      router.push(`/modelos?${searchParams.toString()}`);
    }
  }
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={PreviousPagination}
            className={`${searchParams.get('pagination') ? 'flex' : 'hidden'} hover:bg-black/30`}
          />
        </PaginationItem>
        {searchParams.get('pagination') &&
        count > Number(searchParams.get('pagination')) + 1 ? (
          <>
            <PaginationItem>
              <PaginationLink
                onClick={(e) =>
                  ChangePagination(
                    Number(searchParams.get('pagination')) - 1,
                    e
                  )
                }
              >
                {Number(searchParams.get('pagination')) - 1}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className='bg-blue-300'
                onClick={(e) =>
                  ChangePagination(Number(searchParams.get('pagination')), e)
                }
              >
                {Number(searchParams.get('pagination'))}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                onClick={(e) =>
                  ChangePagination(
                    Number(searchParams.get('pagination')) + 1,
                    e
                  )
                }
              >
                {Number(searchParams.get('pagination')) + 1}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink onClick={(e) => ChangePagination(count, e)}>
                {count}
              </PaginationLink>
            </PaginationItem>
          </>
        ) : count == Number(searchParams.get('pagination')) + 1 && count > 2 ? (
          <>
            <PaginationItem>
              <PaginationLink
                onClick={(e) =>
                  ChangePagination(
                    Number(searchParams.get('pagination')) - 1,
                    e
                  )
                }
              >
                {Number(searchParams.get('pagination')) - 1}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className='bg-blue-300'
                onClick={(e) =>
                  ChangePagination(Number(searchParams.get('pagination')), e)
                }
              >
                {Number(searchParams.get('pagination'))}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                onClick={(e) =>
                  ChangePagination(
                    Number(searchParams.get('pagination')) + 1,
                    e
                  )
                }
              >
                {Number(searchParams.get('pagination')) + 1}
              </PaginationLink>
            </PaginationItem>
          </>
        ) : Number(searchParams.get('pagination')) == count && count > 2 ? (
          <>
            <PaginationItem>
              <PaginationLink
                onClick={(e) =>
                  ChangePagination(
                    Number(searchParams.get('pagination')) - 2,
                    e
                  )
                }
              >
                {Number(searchParams.get('pagination')) - 2}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                onClick={(e) =>
                  ChangePagination(
                    Number(searchParams.get('pagination')) - 1,
                    e
                  )
                }
              >
                {Number(searchParams.get('pagination')) - 1}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className='bg-blue-300'
                onClick={(e) =>
                  ChangePagination(Number(searchParams.get('pagination')), e)
                }
              >
                {Number(searchParams.get('pagination'))}
              </PaginationLink>
            </PaginationItem>
          </>
        ) : count > 3 ? (
          <>
            <PaginationItem>
              <PaginationLink
                className='bg-blue-300'
                onClick={(e) => ChangePagination(1, e)}
              >
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className='hover:cursor-pointer'
                onClick={(e) => ChangePagination(2, e)}
              >
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink onClick={(e) => ChangePagination(3, e)}>
                3
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink onClick={(e) => ChangePagination(count, e)}>
                {count}
              </PaginationLink>
            </PaginationItem>
          </>
        ) : (
          <>
            <PaginationItem>
              <PaginationLink
                className={`${Number(searchParams.get('pagination')) ? '' : 'bg-blue-300'}`}
                onClick={(e) => ChangePagination(1, e)}
              >
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className={`${count > 1 ? 'block' : 'hidden'} ${Number(searchParams.get('pagination')) === 2 ? 'bg-blue-300' : ''}`}
                onClick={(e) => ChangePagination(2, e)}
              >
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className={`${count > 2 ? 'block' : 'hidden'} ${Number(searchParams.get('pagination')) === 3 ? 'bg-blue-300' : ''}`}
                onClick={(e) => ChangePagination(3, e)}
              >
                3
              </PaginationLink>
            </PaginationItem>
          </>
        )}
        <PaginationItem>
          <PaginationNext
            onClick={NextPagination}
            className={`${Number(searchParams.get('pagination')) === count ? 'hidden' : 'flex'} hover:bg-black/30`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComp;
