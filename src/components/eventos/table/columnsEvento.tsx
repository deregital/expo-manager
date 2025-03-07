'use client';

import { Button } from '@/components/ui/button';
import { type RouterOutputs } from '@/server';
import { type ColumnDef, type SortDirection } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { iconsAndTexts } from '@/components/ui/ticket/iconsAndTexts';
import { Input } from '@/components/ui/input';
import { type Tag } from 'expo-backend-types';
import { Badge } from '@/components/ui/badge';
import { getTextColorByBg } from '@/lib/utils';

export function generateParticipantColumns(
  eventTagsId: Tag['id'][],
  tickets: RouterOutputs['ticket']['getByEventId']
) {
  const columns: ColumnDef<RouterOutputs['profile']['getByTags'][number]>[] = [
    {
      accessorKey: 'shortId',
      header: ({ column }) => {
        return (
          <div
            className='mx-auto w-full'
            style={{
              width: `${column.getSize()}px`,
            }}
          >
            <Button
              className='px-1'
              variant='ghost'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              ID
              <SortingIcon isSorted={column.getIsSorted()} />
            </Button>
          </div>
        );
      },
      minSize: 50,
      size: 50,
      maxSize: 50,
      enableResizing: false,
      cell: ({ row }) => {
        return <p className='w-full text-center'>{row.original.shortId}</p>;
      },
    },
    {
      accessorKey: 'fullName',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            className='pl-0'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nombre
            <SortingIcon isSorted={column.getIsSorted()} />
          </Button>
        );
      },
    },
    {
      accessorKey: 'tags',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            className='pl-0'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Etiquetas
            <SortingIcon isSorted={column.getIsSorted()} />
          </Button>
        );
      },
      size: 100,
      minSize: 100,
      maxSize: 100,
      cell: ({ row }) => {
        const matchingTags = row.original.tags.filter((tag) =>
          eventTagsId.includes(tag.id)
        );
        return (
          <div className='flex flex-nowrap gap-x-2'>
            {matchingTags.map((tag) => (
              <Badge
                key={tag.id}
                style={{
                  backgroundColor: tag.group.color,
                  color: getTextColorByBg(tag.group.color),
                }}
                className='mr-1 max-w-24'
              >
                <span className='truncate'>{tag.name}</span>
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            className='pl-0'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Tiene Ticket?
            <SortingIcon isSorted={column.getIsSorted()} />
          </Button>
        );
      },
      size: 100,
      minSize: 100,
      maxSize: 100,
      accessorKey: 'ticket',
      cell: ({ row }) => {
        const ticket = tickets.find((t) => t.profile?.id === row.original.id);
        return (
          <Input
            type='checkbox'
            className='size-6'
            disabled
            checked={!!ticket}
          />
        );
      },
    },
  ];
  return columns;
}

type SortingIconProps = {
  isSorted: false | SortDirection;
};

const SortingIcon = ({ isSorted }: SortingIconProps) => {
  return isSorted ? (
    {
      asc: <ArrowDown className='ml-2 h-4 w-4 transform' />,
      desc: <ArrowUp className='ml-2 h-4 w-4' />,
    }[isSorted === 'desc' ? 'desc' : 'asc']
  ) : (
    <ArrowUpDown className='ml-2 h-4 w-4' />
  );
};

export function generateTicketColumns() {
  const columns: ColumnDef<RouterOutputs['ticket']['getByEventId'][number]>[] =
    [
      {
        accessorKey: 'type',
        header: ({ column }) => {
          return (
            <div
              className='mx-auto w-full'
              style={{
                width: `${column.getSize()}px`,
              }}
            >
              <Button
                className='px-1'
                variant='ghost'
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === 'asc')
                }
              >
                Tipo
                <SortingIcon isSorted={column.getIsSorted()} />
              </Button>
            </div>
          );
        },
        minSize: 50,
        size: 50,
        maxSize: 50,
        enableResizing: false,
        cell: ({ row }) => {
          const { icon, text } = iconsAndTexts[row.original.type];
          return (
            <div className='flex items-center justify-center gap-2 text-sm'>
              {icon}
              <span>{text}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'fullName',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              className='pl-0'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              Nombre
              <SortingIcon isSorted={column.getIsSorted()} />
            </Button>
          );
        },
        minSize: 50,
        size: 50,
        maxSize: 50,
        enableResizing: false,
        cell: ({ row }) => {
          return <p className='w-full'>{row.original.fullName}</p>;
        },
      },
      {
        accessorKey: 'mail',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              className='pl-0'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              Correo
              <SortingIcon isSorted={column.getIsSorted()} />
            </Button>
          );
        },
        minSize: 50,
        size: 50,
        maxSize: 50,
        enableResizing: false,
        cell: ({ row }) => {
          return <p className='w-full'>{row.original.mail}</p>;
        },
      },
      {
        accessorKey: 'used',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              className='pl-0'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              Usado
              <SortingIcon isSorted={column.getIsSorted()} />
            </Button>
          );
        },
        minSize: 50,
        size: 50,
        maxSize: 50,
        enableResizing: false,
        cell: ({ row }) => {
          return (
            <Input
              type='checkbox'
              className='size-6'
              disabled
              checked={/*TODO: CHEQUEO DE SI FUE ESCANEADO*/ false}
            />
          );
        },
      },
    ];

  return columns;
}
