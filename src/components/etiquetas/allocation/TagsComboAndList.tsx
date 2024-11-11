import {
  allocationComboBoxOpens,
  allocationSelectedData,
} from '@/components/etiquetas/allocation/ProfilesComboAndList';
import ComboBox from '@/components/ui/ComboBox';
import { notChoosableTagTypes } from '@/lib/constants';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import { Trash } from 'lucide-react';
import React, { useMemo } from 'react';

interface TagsComboAndListProps {}

const TagsComboAndList = ({}: TagsComboAndListProps) => {
  const { data: tagGroupsData, isLoading: tagGroupLoading } =
    trpc.tagGroup.getAll.useQuery();
  const { data: tagsData, isLoading: tagsLoading } = trpc.tag.getAll.useQuery();

  const {
    tags,
    setTags,
    group: currentGroup,
    setGroup: setCurrentGroup,
  } = allocationSelectedData();

  const {
    groups: openGroups,
    setGroupsOpen: setOpenGroups,
    tags: tagsOpen,
    setTags: setTagsOpen,
  } = allocationComboBoxOpens();

  const choosableTags = useMemo(() => {
    const possibleTags = tagsData?.filter((tag) => {
      if (notChoosableTagTypes.includes(tag.type)) return false;
      if (!currentGroup)
        return !tags.find(
          (t) =>
            t.id === tag.id ||
            (tag.group.isExclusive && t.groupId === tag.groupId)
        );

      return tag.groupId === currentGroup.id;
    });

    if (!currentGroup) {
      return possibleTags?.filter((et) => !tags.find((e) => e.id === et.id));
    }

    return possibleTags?.filter(
      (tag) =>
        tag.groupId === currentGroup.id &&
        !tags.some((t) => t.groupId === tag.groupId && tag.group.isExclusive) &&
        !tags.find((t) => t.id === tag.id)
    );
  }, [tagsData, currentGroup, tags]);

  const choosableGroups = useMemo(() => {
    return tagGroupsData?.filter((g) =>
      g.tags.some((tag) => !notChoosableTagTypes.includes(tag.type))
    );
  }, [tagGroupsData]);

  return (
    <>
      <div className='flex flex-col gap-4 sm:flex-row'>
        <ComboBox
          open={openGroups}
          setOpen={setOpenGroups}
          isLoading={tagGroupLoading}
          triggerChildren={<p>{currentGroup?.name ?? 'Grupos'}</p>}
          notFoundText='No hay grupos disponibles'
          placeholder='Buscar grupos...'
          data={choosableGroups ?? []}
          id='id'
          value='name'
          wFullMobile
          onSelect={(value) => {
            setCurrentGroup(
              tagGroupsData!.find(
                (group) => group.id === value
              ) as RouterOutputs['tagGroup']['getAll'][number]
            );
            setOpenGroups(false);
          }}
          selectedIf={currentGroup?.id ?? ''}
        />
        <ComboBox
          data={choosableTags ?? []}
          id='id'
          open={tagsOpen}
          setOpen={setTagsOpen}
          onSelect={(value) => {
            setTags(
              tagsData!.find(
                (tag) => tag.id === value
              ) as RouterOutputs['tag']['getAll'][number]
            );
            setTagsOpen(false);
          }}
          selectedIf=''
          wFullMobile
          value='name'
          triggerChildren={<p>Etiquetas</p>}
          isLoading={tagsLoading}
          notFoundText='No hay etiquetas disponibles'
          placeholder='Buscar etiquetas...'
        />
      </div>
      <div
        className={cn(
          tags.length > 0 && 'mt-2 rounded-md border border-gray-500'
        )}
      >
        {tags.map((tag) => (
          <div
            className='flex w-full justify-between p-1'
            style={{ backgroundColor: `${tag.group.color}80` }}
            key={tag.id}
          >
            <p>{tag.name}</p>
            <Trash
              className='cursor-pointer fill-red-500 text-red-900'
              onClick={() => setTags(tag)}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default TagsComboAndList;
