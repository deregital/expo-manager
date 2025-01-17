import TagsContent from '@/components/etiquetas/list/EtiquetasContent';
import { useTagsSettings } from '@/components/etiquetas/list/ExpandContractTags';
import GroupTrigger from '@/components/etiquetas/list/GroupTrigger';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn, getTextColorByBg } from '@/lib/utils';
import { type FindAllWithTagsResponseDto } from 'expo-backend-types';
import React, { useEffect, useState } from 'react';

export type GroupWithMatch = Omit<
  FindAllWithTagsResponseDto['groups'][number],
  'tags'
> & {
  match: boolean;
  tags: (FindAllWithTagsResponseDto['groups'][number]['tags'][number] & {
    match: boolean;
  })[];
};

interface TagsListProps {
  groups: GroupWithMatch[];
}

const TagsList = ({ groups }: TagsListProps) => {
  const [active, setActive] = useState<string[]>([]);
  const [prevShowEvento, setPrevShowEvento] = useState<boolean>(false);
  const {
    state,
    contract: setContract,
    showEventos,
    expand: setExpand,
  } = useTagsSettings();

  useEffect(() => {
    if (state === 'EXPAND') {
      setActive(groups.map((group) => group.id));
    } else if (state === 'NONE') {
      setActive(
        groups
          .filter((group) => group.tags.some((tag) => tag.match))
          .map((g) => g.id)
      );
    } else {
      if (prevShowEvento !== showEventos) {
        setPrevShowEvento(showEventos);
        return;
      }
      setActive([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, state]);

  if (groups.length === 0) {
    return (
      <div className='flex h-96 flex-col items-center justify-center gap-y-2'>
        <h3 className='text-xl text-slate-500'>No hay etiquetas</h3>
        <p className='text-sm text-slate-400'>
          Cambie el filtro o cree un item
        </p>
      </div>
    );
  }

  return (
    <Accordion
      type='multiple'
      className='pt-4'
      defaultValue={active}
      value={active}
    >
      {groups.map((group) => (
        <AccordionItem
          value={group.id}
          key={group.id}
          title={group.name}
          className='my-2 border-0'
        >
          <AccordionTrigger
            showArrow={group.tags.length > 0}
            onClick={() => {
              if (active.includes(group.id)) {
                setActive(active.filter((id) => id !== group.id));
                if (active.length === 1) {
                  setContract();
                }
              } else {
                const newActive = [...active, group.id];
                if (newActive.length === groups.length) {
                  setExpand();
                }
                setActive(newActive);
              }
            }}
            className={cn('rounded-xl px-2 py-1.5', {
              'cursor-default': group.tags.length === 0,
            })}
            style={{
              backgroundColor: group.color,
              color: getTextColorByBg(group.color),
            }}
          >
            <GroupTrigger group={group} />
          </AccordionTrigger>
          <AccordionContent className='pb-0 pl-2'>
            {group.tags.map((tag) => (
              <TagsContent key={tag.id} tag={tag} background={group.color} />
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default TagsList;
