import CirclePlus from '@/components/icons/CirclePlus';
import CircleXIcon from '@/components/icons/CircleX';
import { Badge } from '@/components/ui/badge';
import { getTextColorByBg } from '@/lib/utils';
import { TagWithGroupColor } from '@/server/types/etiquetas';
import React from 'react';

interface ListaEtiquetasProps {
  tags: TagWithGroupColor[];
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  handleDelete: (tag: TagWithGroupColor) => void;
}

const ListaEtiquetas = ({
  tags,
  children,
  open,
  setOpen,
  handleDelete,
}: ListaEtiquetasProps) => {
  return (
    <div className='w-full'>
      <div className='flex flex-wrap items-center gap-2'>
        {tags?.map((tag) => (
          <Badge
            className='group whitespace-nowrap transition-transform duration-200 ease-in-out hover:shadow-md'
            style={{
              backgroundColor: tag.group.color,
              color: getTextColorByBg(tag.group.color),
            }}
            key={tag.id}
          >
            {tag.name}

            <CircleXIcon
              onClick={() => handleDelete(tag)}
              className='invisible w-0 cursor-pointer group-hover:visible group-hover:ml-1 group-hover:w-4'
              width={16}
              height={16}
            />
          </Badge>
        ))}
        {!open ? (
          <CirclePlus
            className='h-5 w-5 cursor-pointer'
            onClick={() => setOpen(true)}
          />
        ) : (
          <CircleXIcon
            className='h-5 w-5 cursor-pointer'
            onClick={() => setOpen(false)}
          />
        )}
      </div>

      {open && children}
    </div>
  );
};

export default ListaEtiquetas;
