import { RouterOutputs } from '@/server';
import { useMemo } from 'react';

export function useProgress(
  profiles: RouterOutputs['modelo']['getByTags'],
  tagAssistedId: string
) {
  return useMemo(() => {
    if (!profiles) return 0;
    const assisted = profiles.filter((profile) =>
      profile.tags.find((tag) => tag.id === tagAssistedId)
    ).length;

    const percentage = (assisted / profiles.length) * 100;

    if (isNaN(percentage)) return 0;
    return percentage % 1 === 0 ? percentage : Number(percentage.toFixed(2));
  }, [tagAssistedId, profiles]);
}
