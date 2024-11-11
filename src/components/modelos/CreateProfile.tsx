'use client';
import { RouterOutputs } from '@/server';
import { Button } from '../ui/button';
import ModalCreateProfile from './CreateProfileModal';
import { create } from 'zustand';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Comment, Profile } from 'expo-backend-types';

type ProfileModal = {
  open: boolean;
  profile: Omit<
    Profile,
    | 'id'
    | 'shortId'
    | 'firstName'
    | 'profilePictureUrl'
    | 'created_at'
    | 'updated_at'
    | 'birthLocationId'
    | 'residenceLocationId'
    | 'isInTrash'
    | 'movedToTrashDate'
  > & {
    birthLocation: {
      city: string;
      state: string;
      longitude: number;
      latitude: number;
      country: string;
    };
    residenceLocation: {
      city: string;
      country: string;
      state: string;
      longitude: number;
      latitude: number;
    };
    tags: NonNullable<RouterOutputs['tag']['getById']>[];
    comments: Pick<Comment, 'content' | 'isSolvable'>[];
  };
  resetProfile: () => void;
};

const defaultProfile = {
  fullName: '',
  phoneNumber: '',
  secondaryPhoneNumber: null,
  birthDate: null,
  gender: 'N/A',
  tags: [] as ProfileModal['profile']['tags'],
  alternativeNames: [] as ProfileModal['profile']['alternativeNames'],
  dni: null,
  mail: null,
  instagram: null,
  birthLocation: {
    country: 'Argentina',
    city: '',
    state: '',
    longitude: 0,
    latitude: 0,
  },
  residenceLocation: {
    latitude: 0,
    longitude: 0,
    country: '',
    state: '',
    city: '',
  },
  comments: [] as ProfileModal['profile']['comments'],
} satisfies ProfileModal['profile'];

export const useCreateProfileModal = create<ProfileModal>((set) => ({
  open: false,
  profile: defaultProfile,
  resetProfile: () => set({ profile: defaultProfile }),
}));

const CreateProfile = () => {
  const searchParams = new URLSearchParams(useSearchParams());
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.get('modal') ?? '');

  useEffect(() => {
    setSearch(searchParams.get('modal') ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('modal')]);

  return (
    <>
      <Button
        className='mx-3 mb-0 mt-3 md:mx-5'
        onClick={() => {
          searchParams.set('modal', 'true');
          router.push(`${pathname}?${searchParams.toString()}`);
        }}
      >
        Crear Participante
      </Button>
      <ModalCreateProfile open={search === 'true' ? true : false} />
    </>
  );
};

export default CreateProfile;
