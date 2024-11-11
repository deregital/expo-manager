import ProfileFillIcon from '@/components/icons/ModeloFillIcon';
import { type SimilarityProfile } from 'expo-backend-types';
import { useRouter } from 'next/navigation';
import React from 'react';

interface SimilarProfilesProps {
  similarityProfiles: SimilarityProfile[];
}

const SimilarProfiles = ({ similarityProfiles }: SimilarProfilesProps) => {
  const router = useRouter();
  return similarityProfiles.map(({ profile }) => (
    <div key={profile.id} className='flex items-center justify-between'>
      <p>
        <span className='font-bold'>Nombre:</span> {profile.fullName}
      </p>
      <p>
        <span className='font-bold'>Teléfono:</span> {profile.phoneNumber}
      </p>
      <ProfileFillIcon
        className='h-6 w-6 hover:text-gray-400'
        onClick={() => {
          router.push(`/modelo/${profile.id}`);
        }}
      />
    </div>
  ));
};

export default SimilarProfiles;
