import SearchIcon from '@/components/icons/SearchIcon';
import { Input } from '@/components/ui/input';
import React from 'react';

interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (_value: string) => void;
}

const SearchInput = ({ onChange, ...props }: SearchInputProps) => {
  return (
    <div className='relative w-full md:max-w-md'>
      <span className='pointer-events-none absolute inset-y-0 right-0 flex cursor-crosshair items-center pr-3 text-muted-foreground'>
        <SearchIcon className='h-5 w-5' />
      </span>
      <Input onChange={(e) => onChange(e.target.value)} {...props} />
    </div>
  );
};

export default SearchInput;
