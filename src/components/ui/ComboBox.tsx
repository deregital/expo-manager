'use client';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn, getTextColorByBg } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';
import React from 'react';

interface ComboBoxProps<
  TData extends Record<string, unknown>,
  Id extends keyof TData,
> {
  open: boolean;
  setOpen: (_open: boolean) => void;
  triggerChildren: React.ReactNode;
  data: TData[];
  id: Id;
  value: keyof TData;
  onSelect: (_value: string) => void;
  selectedIf: TData[Id];
  checkClassName?: string;
  itemStyle?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  buttonClassName?: string;
  wFullMobile?: boolean;
}

const ComboBox = <
  TData extends Record<string, unknown>,
  Id extends keyof TData,
>({
  open,
  setOpen,
  triggerChildren,
  data,
  id,
  value,
  onSelect,
  checkClassName,
  selectedIf,
  itemStyle,
  buttonStyle,
  buttonClassName,
  wFullMobile,
}: ComboBoxProps<TData, Id>) => {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className='text-black' asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn(
            'w-[200px] justify-between',
            wFullMobile && 'w-full md:w-[200px]',
            buttonClassName
          )}
          style={buttonStyle}
        >
          {triggerChildren}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'w-full max-w-[200px] p-0 md:max-w-[200px]',
          wFullMobile && 'w-[--radix-popper-anchor-width] max-w-full'
        )}
      >
        <Command>
          <CommandInput placeholder='Buscar grupo...' className='h-9' />
          <CommandEmpty>Grupo no encontrado.</CommandEmpty>
          <CommandGroup className='p-0'>
            {data.map((item) => (
              <CommandItem
                className='cursor-pointer hover:bg-gray-100'
                key={item[id] as string}
                value={item[id] as string}
                onSelect={onSelect}
                style={
                  'color' in item
                    ? {
                        backgroundColor: item.color as string,
                        color: getTextColorByBg(
                          (item.color as string) ?? '#000000'
                        ),
                        borderRadius: 0,
                        ...itemStyle,
                      }
                    : itemStyle
                }
              >
                {item[value] as string}
                <CheckIcon
                  className={cn(
                    'ml-auto h-4 w-4',
                    selectedIf === item[id] ? 'opacity-100' : 'opacity-0',
                    checkClassName
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboBox;
