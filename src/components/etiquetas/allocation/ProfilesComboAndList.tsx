import ComboBox from '@/components/ui/ComboBox';
import { cn } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import { Trash } from 'lucide-react';
import React from 'react';
import { create } from 'zustand';

interface ProfilesComboYListProps {
  profiles: RouterOutputs['profile']['getAll'];
  profilesLoading: boolean;
}

export const allocationComboBoxOpens = create<{
  profiles: boolean;
  groups: boolean;
  tags: boolean;
  setProfilesOpen: (open: boolean) => void;
  setGroupsOpen: (open: boolean) => void;
  setTags: (open: boolean) => void;
}>((set) => ({
  profiles: false,
  groups: false,
  tags: false,
  setProfilesOpen: (open: boolean) => set({ profiles: open }),
  setGroupsOpen: (open: boolean) => set({ groups: open }),
  setTags: (open: boolean) => set({ tags: open }),
}));

export const allocationSelectedData = create<{
  profiles: RouterOutputs['profile']['getAll'];
  tags: RouterOutputs['tag']['getAll'];
  tagsList: RouterOutputs['tag']['getAll'];
  group: RouterOutputs['tagGroup']['getAll'][number] | undefined;
  setProfiles: (profiles: RouterOutputs['profile']['getAll'][number]) => void;
  setTags: (tags: RouterOutputs['tag']['getAll'][number]) => void;
  setGroup: (group: RouterOutputs['tagGroup']['getAll'][number]) => void;
  clearProfiles: () => void;
  clearTags: () => void;
  clearGroup: () => void;
}>((set, get) => ({
  profiles: [],
  tags: [],
  tagsList: [],
  group: undefined,
  setProfiles: (profiles) => {
    if (get().profiles.find((m) => m.id === profiles.id)) {
      set({
        profiles: get().profiles.filter((m) => m.id !== profiles.id),
      });
      return;
    } else {
      set({
        profiles: [...get().profiles, profiles],
      });
    }
  },
  setTags: (tag) => {
    if (get().tags.find((t) => t.id === tag.id)) {
      set({
        tags: get().tags.filter((t) => t.id !== tag.id),
      });
      return;
    } else {
      set({
        tags: [...get().tags, tag],
      });
    }
  },
  setGroup: (group) => {
    if (get().group === group) {
      set({
        group: undefined,
      });
    } else {
      set({
        group: group,
      });
    }
  },
  clearProfiles: () => set({ profiles: [] }),
  clearTags: () => set({ tags: [] }),
  clearGroup: () => set({ group: undefined }),
}));

const ProfilesComboAndList = ({
  profiles,
  profilesLoading,
}: ProfilesComboYListProps) => {
  const { profilesOpen, setProfilesOpen } = allocationComboBoxOpens((s) => ({
    profilesOpen: s.profiles,
    setProfilesOpen: s.setProfilesOpen,
  }));
  const { profilesList, setProfiles } = allocationSelectedData((s) => ({
    profilesList: s.profiles,
    setProfiles: s.setProfiles,
  }));

  return (
    <>
      <ComboBox
        open={profilesOpen}
        setOpen={setProfilesOpen}
        isLoading={profilesLoading}
        triggerChildren={<p>Modelos</p>}
        notFoundText='No hay participantes disponibles'
        placeholder='Buscar participantes...'
        data={profiles ?? []}
        id='id'
        value='fullName'
        onSelect={(value) => {
          setProfiles(
            profiles!.find(
              (m) => m.id === value
            ) as RouterOutputs['profile']['getAll'][number]
          );
          setProfilesOpen(false);
        }}
        selectedIf={''}
      />
      <div
        className={cn(
          profilesList.length > 0 && 'mt-2 rounded-md border border-gray-500'
        )}
      >
        {profilesList.map((profile) => (
          <div className='flex w-full justify-between p-1' key={profile.id}>
            <p>{profile.fullName}</p>
            <Trash
              className='cursor-pointer fill-red-500 text-red-900'
              onClick={() => setProfiles(profile)}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default ProfilesComboAndList;
