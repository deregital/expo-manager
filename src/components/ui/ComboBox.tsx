'use client';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import Loader from '@/components/ui/loader';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn, getTextColorByBg, searchNormalize } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';
import React, { useMemo } from 'react';

type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

type ComboBoxProps<
  TData extends Record<string, unknown>,
  Id extends KeysOfType<TData, string>,
> = {
  open: boolean;
  setOpen: (_open: boolean) => void;
  triggerChildren: React.ReactNode;
  data: TData[];
  filteredData?: TData[];
  id: Id;
  value: keyof TData | ((data: TData) => string);
  onSelect: (_value: string) => void;
  selectedIf: TData[Id];
  checkClassName?: string;
  itemStyle?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  buttonClassName?: string;
  wFullMobile?: boolean;
  enabled?: Array<TData[Id]>;
  isLoading?: boolean;
  contentClassName?: string;
  placeholder?: string;
  notFoundText?: string;
};

const ComboBox = <
  TData extends Record<string, unknown>,
  Id extends KeysOfType<TData, string>,
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
  enabled,
  isLoading,
  contentClassName,
  placeholder,
  notFoundText,
  filteredData,
}: ComboBoxProps<TData, Id>) => {
  const isGrupo = 'color' in (data[0] ?? {});
  const placeholderInput = isGrupo ? 'Buscar grupo...' : 'Buscar etiqueta...';
  const commandEmpty = isGrupo
    ? 'Grupo no encontrado.'
    : 'Etiqueta no encontrada.';

  const val = useMemo(
    () =>
      typeof value === 'function'
        ? value
        : (item: TData) => item[value] as string,
    [value]
  );

  const dataSelectedFirst = useMemo(() => {
    const selectedItem = data.find((item) => item[id] === selectedIf);
    const sortedData = (filteredData || data)
      .filter((item) => item[id] !== selectedIf)
      .sort((a, b) => val(a).localeCompare(val(b)));

    return selectedItem ? [selectedItem, ...sortedData] : sortedData;
  }, [data, filteredData, id, selectedIf, val]);

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
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
          style={
            isGrupo
              ? {
                  backgroundColor: data.find((d) => d['id'] === selectedIf)
                    ?.color as string,
                  color: getTextColorByBg(
                    (data.find((d) => d['id'] === selectedIf)
                      ?.color as string) ?? '#ffffff'
                  ),
                  ...buttonStyle,
                }
              : buttonStyle
          }
        >
          {triggerChildren}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'w-full max-w-[200px] p-0 sm:max-w-[200px]',
          wFullMobile && 'w-[--radix-popper-anchor-width] max-w-full',
          contentClassName
        )}
      >
        <Command>
          <CommandInput
            placeholder={placeholder ?? placeholderInput}
            className='h-9'
          />
          <CommandGroup className='max-h-40 overflow-y-auto p-0'>
            {isLoading && (
              <CommandItem className='flex items-center justify-center p-2'>
                <Loader />
              </CommandItem>
            )}
            {data.length === 0 && !isLoading && (
              <CommandItem>{notFoundText ?? commandEmpty}</CommandItem>
            )}
            {dataSelectedFirst.map((item) => (
              <CommandItem
                disabled={enabled && !enabled.includes(item[id])}
                className='cursor-pointer hover:bg-gray-100'
                key={item[id] as string}
                value={val(item)}
                onSelect={(selectedValue) => {
                  const selectedItem = data.find(
                    (it) =>
                      val(it).toLowerCase() === selectedValue.toLowerCase()
                  );

                  if (!selectedItem) return;

                  onSelect(selectedItem[id] as string);
                  setOpen(false);
                }}
                style={
                  isGrupo
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
                {val(item)}
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
