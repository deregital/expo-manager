import { Filtro } from '@/lib/filter';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export const useSearchQuery = <T extends keyof Filtro>(
  searchParams: ReadonlyURLSearchParams,
  query: T
): Filtro[T] | null => {
  return useMemo(() => {
    const queryString = searchParams.get(query);
    if (!queryString) {
      return null;
    }

    try {
      const parsed = JSON.parse(queryString);
      if (Array.isArray(parsed)) {
        return parsed as Filtro[T];
      } else if (Number.isInteger(parsed) && typeof parsed === 'number') {
        return parsed.toString() as Filtro[T];
      }
      return parsed as Filtro[T];
    } catch (error) {
      return queryString as Filtro[T];
    }
  }, [query, searchParams]);
};
