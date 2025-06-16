import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CheckIcon, PlusIcon } from 'lucide-react';

interface CreateFormInputProps {
  isCreating: boolean;
  setIsCreating: (isCreating: boolean) => void;
  name: string;
  setName: (name: string) => void;
  onSubmit: () => void;
}

const CreateFormInput = ({
  isCreating,
  setIsCreating,
  name,
  setName,
  onSubmit,
}: CreateFormInputProps) => {
  return (
    <>
      {isCreating ? (
        <div className='relative max-w-48'>
          <Input
            type='text'
            className='w-full pr-[3.25rem]'
            value={name}
            autoFocus
            onBlur={(e) => {
              const isClickingSubmit =
                e.relatedTarget?.getAttribute('role') === 'button';
              if (!isClickingSubmit) {
                setIsCreating(false);
                setName('');
              }
            }}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim() !== '') {
                e.preventDefault();
                onSubmit();
              }
            }}
          />
          <div
            className={cn(
              'absolute right-0 top-0 cursor-pointer',
              buttonVariants({ variant: 'default' }),
              name.trim() === '' && 'opacity-50'
            )}
            role='button'
            tabIndex={0}
            onClick={() => {
              if (name.trim() !== '') {
                onSubmit();
              }
            }}
          >
            <CheckIcon className='block h-4 w-4' />
          </div>
        </div>
      ) : (
        <Button onClick={() => setIsCreating(true)}>
          <PlusIcon className='block h-4 w-4' />
        </Button>
      )}
    </>
  );
};

export default CreateFormInput;
