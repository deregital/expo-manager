import SearchIcon from '@/components/icons/SearchIcon';
import { Input } from '@/components/ui/input';
import React from 'react';

interface SearchInputProps {
  onChange: (_value: string) => void;
}

const SearchInput = ({ onChange }: SearchInputProps) => {
  return (
    <div className='relative w-full max-w-md'>
      <span className='pointer-events-none absolute inset-y-0 right-0 flex cursor-crosshair items-center pr-3 text-muted-foreground'>
        <SearchIcon className='h-5 w-5' />
      </span>
      <Input
        placeholder='Buscar grupo o etiqueta'
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
