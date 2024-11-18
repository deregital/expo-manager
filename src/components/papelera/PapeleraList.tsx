import Loader from '@/components/ui/loader';
import React from 'react';
import { type RouterOutputs } from '@/server';
import PapeleraRow from '@/components/papelera/PapeleraRow';

interface PapeleraListProps {
  profiles: RouterOutputs['profile']['getProfilesInTrash'];
  isLoading: boolean;
}

const PapeleraList = ({ profiles, isLoading }: PapeleraListProps) => {
  const sortedProfiles = profiles.sort((a, b) => {
    const dateA = a.movedToTrashDate
      ? new Date(a.movedToTrashDate).getTime()
      : 0;
    const dateB = b.movedToTrashDate
      ? new Date(b.movedToTrashDate).getTime()
      : 0;
    return dateB - dateA;
  });

  return (
    <div className='flex max-w-full flex-1 flex-col gap-y-2'>
      {isLoading ? (
        <div className='flex h-full w-full items-center justify-center'>
          <Loader />
        </div>
      ) : (
        sortedProfiles.length === 0 && (
          <div className='flex h-full w-full items-center justify-center'>
            <p className='text-gray-500'>No hay participantes en la papelera</p>
          </div>
        )
      )}
      {sortedProfiles.map((profile) => (
        <PapeleraRow key={profile.id} profile={profile} />
      ))}
    </div>
  );
};

export default PapeleraList;
