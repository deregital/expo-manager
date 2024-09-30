import SearchIcon from '@/components/icons/SearchIcon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import React from 'react';

interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (_value: string) => void;
}

const SearchInput = ({ onChange, className, ...props }: SearchInputProps) => {
  return (
    <div className={cn('relative w-full', className)}>
      <span className='pointer-events-none absolute inset-y-0 right-0 flex cursor-crosshair items-center pr-2 text-muted-foreground'>
        <SearchIcon className='h-5 w-5' />
      </span>
      <Input
        onChange={(e) => onChange(e.target.value)}
        className={className}
        {...props}
      />
    </div>
  );
};

export default SearchInput;
