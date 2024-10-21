import { FiltroTraducido } from '@/lib/filter';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export const useSearchQuery = <T extends keyof FiltroTraducido>(
  searchParams: ReadonlyURLSearchParams,
  query: T
): FiltroTraducido[T] | null => {
  return useMemo(() => {
    const queryString = searchParams.get(query);
    if (!queryString) {
      return null;
    }

    try {
      const parsed = JSON.parse(queryString);
      if (Array.isArray(parsed)) {
        return parsed as FiltroTraducido[T];
      } else if (Number.isInteger(parsed) && typeof parsed === 'number') {
        return parsed.toString() as FiltroTraducido[T];
      }
      return parsed as FiltroTraducido[T];
    } catch (error) {
      return queryString as FiltroTraducido[T];
    }
  }, [query, searchParams]);
};
