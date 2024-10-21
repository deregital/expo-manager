import EtiquetaFillIcon from '@/components/icons/EtiquetaFillIcon';
import EtiquetasFillIcon from '@/components/icons/EtiquetasFillIcon';
import ComboBox from '@/components/ui/ComboBox';
import { useFiltro } from '@/components/ui/filtro/Filtro';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/lib/trpc';
import React, { useState, useMemo } from 'react';

type FiltroBasicoEtiquetaProps = {
  editTag: (tag: string) => void;
  editTagGroup: (tagGroup: string) => void;
  groupId: string | undefined;
  tagId: string | undefined;
  switchDisabled: boolean;
  include: boolean;
  setInclude: (value: boolean) => void;
};

const FiltroBasicoEtiqueta = ({
  editTag,
  editTagGroup,
  groupId,
  tagId,
  switchDisabled,
  include,
  setInclude,
}: FiltroBasicoEtiquetaProps) => {
  const { filterTags } = useFiltro((s) => ({
    filterTags: s.tags,
  }));
  const [openGroup, setOpenGroup] = useState(false);
  const [openTag, setOpenTag] = useState(false);

  const { data: tagGroupsData, isLoading: isLoadingGroups } =
    trpc.tagGroup.getAll.useQuery();

  const { data: tagsData, isLoading: isLoadingTags } = groupId
    ? trpc.tag.getByGroupId.useQuery(groupId)
    : trpc.tag.getAll.useQuery();

  const filteredTags = useMemo(() => {
    return tagsData?.filter((tag) => {
      return !filterTags.find((filterTag) => filterTag.tag.id === tag.id);
    });
  }, [tagsData, filterTags]);

  return (
    <div className='flex w-full flex-col items-center gap-4 md:w-fit md:flex-row'>
      <Switch
        className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 disabled:data-[state=checked]:bg-green-800 disabled:data-[state=unchecked]:bg-red-800'
        disabled={switchDisabled}
        checked={include}
        onCheckedChange={(e) => {
          setInclude(e);
        }}
      />
      <ComboBox
        data={tagGroupsData ?? []}
        id='id'
        value='name'
        onSelect={(value) => {
          setOpenGroup(false);
          editTagGroup(value);
        }}
        open={openGroup}
        isLoading={isLoadingGroups}
        setOpen={setOpenGroup}
        wFullMobile
        selectedIf={groupId ?? ''}
        triggerChildren={
          <>
            <span className='truncate'>
              {groupId
                ? (tagGroupsData?.find((group) => group.id === groupId)?.name ??
                  'Buscar grupo...')
                : 'Buscar grupo...'}
            </span>
            <EtiquetasFillIcon className='h-5 w-5' />
          </>
        }
      />
      <ComboBox
        data={tagsData ?? []}
        filteredData={filteredTags}
        id='id'
        value='name'
        onSelect={(value) => {
          setOpenTag(false);
          editTag(value);
        }}
        open={openTag}
        wFullMobile
        isLoading={isLoadingTags}
        setOpen={setOpenTag}
        selectedIf={tagId ?? ''}
        triggerChildren={
          <>
            <span className='truncate'>
              {tagId
                ? (tagsData?.find((tag) => tag.id === tagId)?.name ??
                  'Buscar etiqueta...')
                : 'Buscar etiqueta...'}
            </span>
            <EtiquetaFillIcon className='h-5 w-5' />
          </>
        }
      />
    </div>
  );
};

export default FiltroBasicoEtiqueta;
