import { useFiltro } from '@/components/ui/filtro/Filtro';
import FiltroBasicoEtiqueta from '@/components/ui/filtro/FiltroBasicoEtiqueta';
import ShowEtiqueta from '@/components/ui/ShowEtiqueta';
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { Switch } from '@/components/ui/switch';

interface FiltroAvanzadoEtiquetasYGruposProps {}

const FiltroAvanzadoEtiquetasYGrupos =
  ({}: FiltroAvanzadoEtiquetasYGruposProps) => {
    const { tags, groups } = useFiltro();
    const [include, setInclude] = useState(true);
    const [tagGroupId, setTagGroupId] = useState<string | undefined>(undefined);
    const [tagId, setTagId] = useState<string | undefined>(undefined);

    const { data: tagGroupsData } = trpc.tagGroup.getAll.useQuery();
    const { data: tagsData } = tagGroupId
      ? trpc.tag.getByGroupId.useQuery(tagGroupId)
      : trpc.tag.getAll.useQuery();

    const advancedTags = useMemo(() => {
      return tags.length > 1 ? tags.slice(1) : [];
    }, [tags]);

    const advancedGroups = useMemo(() => {
      return groups.length > 1 ? groups.slice(1) : [];
    }, [groups]);

    function handleDeleteTag(id: string) {
      useFiltro.setState({
        tags: tags.filter((tag) => tag.tag.id !== id),
      });
    }

    function handleDeleteGroup(id: string) {
      useFiltro.setState({
        groups: groups.filter((gr) => gr.group.id !== id),
      });
    }

    function handleAddTag(id: string) {
      if (tagId === id) {
        setTagId(undefined);
        return;
      }
      setTagId(id);
    }

    function handleAddGroup(id: string) {
      if (tagGroupId === id) {
        setTagId(undefined);
        setTagGroupId(undefined);
        return;
      }
      setTagGroupId(id);
    }

    function handleAgregar() {
      if (tagId === undefined && tagGroupId === undefined) {
        return;
      }

      const tagOrGroup: 'et' | 'gr' = tagId !== undefined ? 'et' : 'gr';

      if (tagOrGroup === 'et') {
        const tagToAdd = tagsData?.find((et) => et.id === tagId)!;
        useFiltro.setState({
          tags: [
            ...tags,
            {
              tag: {
                id: tagToAdd.id,
                name: tagToAdd.name,
              },
              include,
            },
          ],
        });
      } else {
        const groupToAdd = tagGroupsData?.find((gr) => gr.id === tagGroupId)!;
        useFiltro.setState({
          groups: [
            ...groups,
            {
              group: {
                id: groupToAdd.id,
                name: groupToAdd.name,
                color: groupToAdd.color,
              },
              include,
            },
          ],
        });
      }

      setTagId(undefined);
      setTagGroupId(undefined);
    }

    return (
      <div className='flex flex-col gap-y-2'>
        {advancedTags.map((tag, index) => (
          <div key={index} className='flex items-center space-x-2 pb-2'>
            {/* <p>{etiqueta.include ? 'SI' : 'NO'}</p> */}
            <Switch
              className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 disabled:data-[state=checked]:bg-green-800 disabled:data-[state=unchecked]:bg-red-800'
              disabled
              checked={tag.include}
            />
            <ShowEtiqueta tag={tag.tag} />
            <Button onClick={() => handleDeleteTag(tag.tag.id)}>
              Eliminar
            </Button>
          </div>
        ))}
        {advancedGroups.map((group, index) => (
          <div key={index} className='flex items-center space-x-2 pb-2'>
            <p>{group.include ? 'SI' : 'NO'}</p>
            <ShowEtiqueta tag={group.group} />
            <Button onClick={() => handleDeleteGroup(group.group.id)}>
              Eliminar
            </Button>
          </div>
        ))}
        <div className='flex items-center gap-x-4'>
          <FiltroBasicoEtiqueta
            switchDisabled={false}
            include={include}
            setInclude={setInclude}
            editTag={handleAddTag}
            editTagGroup={handleAddGroup}
            groupId={tagGroupId}
            tagId={tagId}
          />
          <Button onClick={handleAgregar}>Agregar</Button>
        </div>
      </div>
    );
  };

export default FiltroAvanzadoEtiquetasYGrupos;
