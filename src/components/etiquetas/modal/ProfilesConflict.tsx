import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RouterOutputs } from '@/server';
import { ShieldQuestionIcon } from 'lucide-react';
import React, { useState } from 'react';

interface ProfilesConflictProps {
  profiles: RouterOutputs['profile']['getByTagGroups'] | undefined;
}

const ProfilesConflict = ({ profiles }: ProfilesConflictProps) => {
  const [showAll, setShowAll] = useState(false);

  if (!profiles || profiles.length === 0) return null;

  return (
    <div className='text-red-500'>
      <p>
        <span>
          <ShieldQuestionIcon className='inline-block' />
        </span>
        <span> Hay modelos con más de una etiqueta este grupo:</span>
      </p>
      <ul className='mt-3'>
        {profiles.map((profile, idx) => {
          if (!showAll && idx >= 4) return null;

          return (
            <li key={`${profile.id}-${idx}`}>
              <a
                rel='noopener noreferrer'
                className='hover:underline'
                href={`/modelo/${profile.id}`}
                target='_blank'
              >
                {profile.fullName}
              </a>
              {' - '}
              {profile.tags.slice(0, 3)?.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={'default'}
                  className='mr-1 select-none'
                  title={tag.name}
                >
                  {tag.name}
                </Badge>
              ))}
            </li>
          );
        })}
        {profiles.length > 4 && (
          <Button
            className='p-0'
            variant={'link'}
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? 'Ver menos' : 'Ver más'}
          </Button>
        )}
      </ul>
    </div>
  );
};

export default ProfilesConflict;
