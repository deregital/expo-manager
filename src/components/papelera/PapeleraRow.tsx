import TrashCanButtons from '@/components/papelera/BotonesPapelera';
import FotoModelo from '@/components/ui/FotoModelo';
import { RouterOutputs } from '@/server';
import { format } from 'date-fns';
import Link from 'next/link';

interface PapeleraRowProps {
  profile: RouterOutputs['profile']['getProfilesInTrash'][number];
}

const PapeleraRow = ({ profile }: PapeleraRowProps) => {
  return (
    <Link
      href={`/modelo/${profile.id}`}
      key={profile.id}
      className='flex items-center justify-between gap-x-4 px-3 py-2 hover:bg-gray-200'
    >
      <div className='flex w-full items-center gap-x-2.5 truncate'>
        <FotoModelo url={profile.profilePictureUrl ?? ''} />
        <p className='w-full truncate py-1'>{profile.fullName}</p>
      </div>
      <div className='flex gap-x-4'>
        <div className='hidden w-fit flex-col items-end sm:flex'>
          <span className='text-sm text-gray-500'>{profile.phoneNumber}</span>
          {profile.movedToTrashDate && (
            <span className='whitespace-nowrap text-sm text-gray-500'>
              En papelera desde:{' '}
              {format(new Date(profile.movedToTrashDate), 'dd/MM/yyyy')}
            </span>
          )}
        </div>
        <TrashCanButtons id={profile.id} isInTrash={true} />
      </div>
    </Link>
  );
};

export default PapeleraRow;
