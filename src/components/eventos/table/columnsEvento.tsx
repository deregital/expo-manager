'use client';

import { Button } from '@/components/ui/button';
import { type RouterOutputs } from '@/server';
import { type ColumnDef, type SortDirection } from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  DownloadIcon,
  MoreHorizontal,
  SendIcon,
  TrashIcon,
} from 'lucide-react';
import { iconsAndTexts } from '@/components/ui/ticket/iconsAndTexts';
import { Input } from '@/components/ui/input';
import { type Tag } from 'expo-backend-types';
import { Badge } from '@/components/ui/badge';
import { getTextColorByBg } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

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
            className='size-6 disabled:opacity-100'
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
      {
        id: 'actions',
        enableHiding: false,
        size: 20,
        cell: ({ row }) => {
          const ticket = row.original;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [sure, setSure] = useState(false);
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [open, setOpen] = useState(false);
          const deleteTicketMutation = trpc.ticket.delete.useMutation();
          const utils = trpc.useUtils();

          return (
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='h-8 w-8 p-0 hover:bg-gray-500/20'
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem
                  className='flex cursor-pointer items-center justify-between'
                  onClick={async (e) => {
                    /*TODO: ENVIAR EMAIL*/
                  }}
                >
                  <span>Reenviar</span>
                  <SendIcon />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='flex cursor-pointer items-center justify-between'
                  onClick={async (e) => {
                    e.preventDefault();
                    toast.loading('Descargando ticket...', {
                      id: `downloading-ticket-${ticket.id}`,
                    });
                    const res = await fetch('/api/ticket/download', {
                      method: 'POST',
                      body: JSON.stringify({ id: ticket.id }),
                    });
                    if (res) {
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);

                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Ticket-${ticket.fullName}-${ticket.event.name}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);

                      URL.revokeObjectURL(url); // Libera memoria
                      setOpen(false);
                      toast.dismiss(`downloading-ticket-${ticket.id}`);
                    } else {
                      toast.error('Error al descargar ticket');
                    }
                  }}
                >
                  Descargar
                  <DownloadIcon />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async (e) => {
                    e.preventDefault();
                    if (sure) {
                      await deleteTicketMutation.mutateAsync(ticket.id);
                      setSure(false);
                      setOpen(false);
                      utils.ticket.getByEventId.invalidate(ticket.eventId);
                      utils.event.getById.invalidate(ticket.eventId);
                      return;
                    }
                    setSure(true);
                  }}
                  data-sure={sure}
                  disabled={deleteTicketMutation.isLoading}
                  className='-mx-1 -mb-1 cursor-pointer bg-red-500 px-3 text-white focus:hover:bg-red-600 focus:hover:text-white data-[sure="true"]:bg-red-600 data-[sure="true"]:hover:bg-red-700'
                >
                  {sure ? 'Estás seguro?' : 'Eliminar ticket'}
                  <TrashIcon />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];

  return columns;
}
