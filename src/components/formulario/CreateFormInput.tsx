import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
            onBlur={() => {
              setIsCreating(false);
              setName('');
            }}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim() !== '') {
                e.preventDefault();
                onSubmit();
              }
            }}
          />
          <Button
            className='absolute right-0 top-0'
            type='submit'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (name.trim() === '') return;
              onSubmit();
            }}
            disabled={name.trim() === ''}
          >
            <CheckIcon className='block h-4 w-4' />
          </Button>
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
