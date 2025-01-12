'use client';
import React, { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';

import TagsList, {
  type GroupWithMatch,
} from '@/components/etiquetas/list/TagsList';
import SearchInput from '@/components/ui/SearchInput';
import TagGroupModal from '@/components/etiquetas/modal/TagGroupModal';
import TagModal from '@/components/etiquetas/modal/TagModal';
import Loader from '@/components/ui/loader';
import { normalize, searchNormalize } from '@/lib/utils';
import ExpandContractTags, {
  useTagsSettings,
} from '@/components/etiquetas/list/ExpandContractTags';
import { ModalTriggerCreate } from '@/components/etiquetas/modal/ModalTrigger';
import Link from 'next/link';
import StampIcon from '@/components/icons/StampIcon';
import SwitchEventos from '@/components/ui/SwitchEventos';
import { XIcon } from 'lucide-react';

const EtiquetasPage = () => {
  const [search, setSearch] = useState('');
  const { data: groups, isLoading } = trpc.tag.getByNombre.useQuery();
  const { state: expandState, none: setNone, showEventos } = useTagsSettings();

  const filteredGroups = useMemo(() => {
    if (!groups) return [];

    let g = showEventos
      ? groups
      : groups.filter((group) => {
          return (
            group.tags.length === 0 ||
            group.tags.some((tag) => tag.type !== 'EVENT')
          );
        });

    if (search !== '') {
      g = g.filter((group) => {
        return (
          group.tags.some((tag) => searchNormalize(tag.name, search)) ||
          searchNormalize(group.name, search)
        );
      });

      if (!g) return [];
    }

    return g.map((group) => {
      return {
        ...group,
        match:
          search.length > 0 &&
          (normalize(group.name).toLowerCase().includes(search.toLowerCase()) ||
            group.name.toLowerCase().includes(search.toLowerCase())),
        tags: group.tags.map((tag) => ({
          ...tag,
          match:
            search.length > 0 &&
            (normalize(tag.name).toLowerCase().includes(search.toLowerCase()) ||
              tag.name.toLowerCase().includes(search.toLowerCase())),
        })),
      };
    });
  }, [groups, search, showEventos]);

  return (
    <>
      <p className='p-3 text-xl font-bold md:p-5 md:text-3xl'>
        Gestor de Etiquetas
      </p>
      <div className='flex flex-col justify-between gap-4 px-3 md:flex-row md:px-5'>
        <div className='flex flex-col gap-4 md:flex-row'>
          <TagGroupModal action='CREATE' />
          <TagModal action='CREATE' />
          <Link href='/asignacion'>
            <ModalTriggerCreate className='w-full md:w-fit' onClick={() => {}}>
              <StampIcon className='mr-3 h-6 w-6' />
              Asignación masiva
            </ModalTriggerCreate>
          </Link>
        </div>
        <div className='flex items-center gap-x-2'>
          <SwitchEventos
            showEventos={showEventos}
            setShowEventos={(value) => {
              useTagsSettings.setState({ showEventos: value });
            }}
          />
          <ExpandContractTags />
          <div className='flex items-center gap-x-4'>
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                if (value === '') {
                  setNone();
                } else if (expandState === 'EXPAND') {
                  setNone();
                }
              }}
              placeholder='Buscar grupo o etiqueta'
            />
          </div>
          <XIcon
            className='h-4 w-4 cursor-pointer'
            onClick={() => setSearch('')}
          />
        </div>
      </div>
      <div className='px-3 md:px-5'>
        {isLoading ? (
          <div className='mt-5 flex justify-center'>
            <Loader />
          </div>
        ) : (
          <TagsList groups={(filteredGroups ?? []) as GroupWithMatch[]} />
        )}
      </div>
    </>
  );
};

export default EtiquetasPage;
