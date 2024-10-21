import EtiquetaFillIcon from '@/components/icons/EtiquetaFillIcon';
import EtiquetasFillIcon from '@/components/icons/EtiquetasFillIcon';
import ComboBox from '@/components/ui/ComboBox';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { RouterOutputs } from '@/server';
import { EtiquetaBaseConGrupoColor } from '@/server/types/etiquetas';
import { type TagType } from 'expo-backend-types';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

function availableGroups(
  tags: EtiquetaBaseConGrupoColor[],
  groupsdata: NonNullable<RouterOutputs['tagGroup']['getAll']>
) {
  const internalTagTypes: TagType[] = ['PARTICIPANT', 'NOT_IN_SYSTEM'];

  return groupsdata.filter((group) => {
    if (group.tags.length === 0) return false;
    if (group.tags.every((tag) => internalTagTypes.includes(tag.type))) {
      return false;
    }
    if (group.isExclusive) {
      const tagIds = tags.map((tag) => tag.grupo.id);
      return !tagIds.includes(group.id);
    } else {
      if (
        group.tags.length ===
        tags.filter((tag) => tag.grupo.id === group.id).length
      )
        return false;
    }
    return true;
  });
}

function availableTags(
  tags: EtiquetaBaseConGrupoColor[],
  tagsData: NonNullable<RouterOutputs['tag']['getAll']>,
  groups: ReturnType<typeof availableGroups>
) {
  return tagsData.filter((tag) => {
    if (tag.type === 'PARTICIPANT' || tag.type === 'NOT_IN_SYSTEM')
      return false;
    if (!groups.map((g) => g.id).includes(tag.group.id)) return false;
    return !tags.map((tag) => tag.id).includes(tag.id);
  });
}

interface AddTagCombosProps {
  tags: EtiquetaBaseConGrupoColor[];
  handleAddTag: (
    addedTag: NonNullable<
      RouterOutputs['modelo']['getById']
    >['etiquetas'][number]
  ) => void;
}

const AddEtiquetaCombos = ({ tags, handleAddTag }: AddTagCombosProps) => {
  const [{ groupId, tagId }, setTagAndGroup] = useState({
    groupId: '',
    tagId: '',
  });
  const [groupOpen, setGroupOpen] = useState(false);
  const [openTag, setOpenTag] = useState(false);

  const { data: tagGroupsData } = trpc.tagGroup.getAll.useQuery();
  const { data: tagsData, isLoading: isLoadingTags } =
    groupId === ''
      ? trpc.tag.getAll.useQuery()
      : trpc.tag.getByGroupId.useQuery(groupId);

  const currentGroup = useMemo(() => {
    return tagGroupsData?.find((group) => group.id === groupId);
  }, [groupId, tagGroupsData]);

  const availableGroupsData = useMemo(
    () => availableGroups(tags, tagGroupsData ?? []),
    [tags, tagGroupsData]
  );

  const availableTagsData = useMemo(
    () => availableTags(tags, tagsData ?? [], availableGroupsData),
    [tags, tagsData, availableGroupsData]
  );

  const selectedTag = useMemo(() => {
    return tagsData?.find((tag) => tag.id === tagId);
  }, [tagId, tagsData]);

  return (
    <div className='mt-2 flex flex-col gap-2 md:flex-row'>
      <ComboBox
        open={groupOpen}
        setOpen={setGroupOpen}
        data={availableGroupsData ?? []}
        id='id'
        wFullMobile
        triggerChildren={
          <>
            <span className='max-w-[calc(100%-30px)] truncate'>
              {groupId ? currentGroup?.name : 'Buscar grupo...'}
            </span>
            <EtiquetasFillIcon className='h-5 w-5' />
          </>
        }
        value='name'
        onSelect={(value) => {
          if (value === groupId) {
            setTagAndGroup({
              groupId: '',
              tagId,
            });
          } else {
            setTagAndGroup({
              groupId: value,
              tagId,
            });
          }
          setGroupOpen(false);
        }}
        enabled={availableGroupsData.map((group) => group.id)}
        selectedIf={groupId}
      />
      <ComboBox
        open={openTag}
        setOpen={setOpenTag}
        data={availableTagsData ?? []}
        id='id'
        value='name'
        onSelect={(value) => {
          setTagAndGroup({
            groupId: groupId,
            tagId: value,
          });
          setOpenTag(false);
        }}
        wFullMobile
        isLoading={isLoadingTags}
        selectedIf={tagId}
        triggerChildren={
          <>
            <span className='truncate'>
              {tagId !== ''
                ? (tagsData?.find((tag) => tag.id === tagId)?.name ??
                  'Buscar etiqueta...')
                : 'Buscar etiqueta...'}
            </span>
            <EtiquetaFillIcon className='h-5 w-5' />
          </>
        }
      />
      <Button
        onClick={() => {
          if (selectedTag) {
            handleAddTag(
              // TODO: Fix this type
              selectedTag as unknown as NonNullable<
                RouterOutputs['modelo']['getById']
              >['etiquetas'][number]
            );
          } else {
            toast.error('Selecciona una etiqueta');
          }
        }}
      >
        Agregar
      </Button>
    </div>
  );
};

export default AddEtiquetaCombos;
