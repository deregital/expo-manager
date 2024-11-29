import { type GroupWithMatch } from '@/components/etiquetas/list/TagsList';
import TagModal from '@/components/etiquetas/modal/TagModal';
import ProfileIcon from '@/components/icons/ProfileIcon';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import { type Filtro as FiltroType } from '@/lib/filter';

interface TagsContentProps {
  tag: GroupWithMatch['tags'][number];
  background: string;
}

const TagsContent = ({ tag, background }: TagsContentProps) => {
  const searchParams = new URLSearchParams();

  function setSearchParams() {
    searchParams.set(
      'etiquetas',
      JSON.stringify([
        {
          tag: { id: tag.id, name: tag.name },
          include: true,
        },
      ] satisfies FiltroType['tags'])
    );
    return searchParams.toString();
  }

  return (
    <div
      className='mb-2 ml-1.5 mt-1.5 flex justify-between rounded-md px-4 py-2 text-black shadow-md shadow-black/30'
      style={{
        backgroundColor: `${background}50`,
      }}
    >
      <p className={cn('capitalize', tag.match && 'underline')}>{tag.name}</p>
      <div className='flex items-center gap-x-2'>
        {tag.type === 'PROFILE' && <TagModal action='EDIT' tag={tag} />}
        <p className='text-sm font-semibold'>{tag._count.profiles}</p>
        <Link href={`/modelos?${setSearchParams()}`}>
          <ProfileIcon className='h-4 w-4 hover:cursor-pointer hover:text-gray-700' />
        </Link>
      </div>
    </div>
  );
};

export default TagsContent;
