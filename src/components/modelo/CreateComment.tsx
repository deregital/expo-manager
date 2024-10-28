import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface CrearCommentProps {
  handleAddComment: (e: React.FormEvent<HTMLFormElement>) => void;
  isSolvable: boolean;
  setIsSolvable: (esResoluble: boolean) => void;
  createComment?: {
    isLoading: boolean;
  };
  textSubmit: string;
}
const CreateComment = ({
  handleAddComment,
  isSolvable,
  setIsSolvable,
  createComment,
  textSubmit,
}: CrearCommentProps) => {
  return (
    <form
      onSubmit={handleAddComment}
      className='flex items-end gap-x-4 rounded-lg bg-gray-300 px-3 pb-3 pt-2'
    >
      <Input
        autoComplete='off'
        name='comment'
        className='flex-grow'
        placeholder='Añadir un comentario'
      />
      <div className='flex flex-col items-center'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className='mb-1 whitespace-nowrap text-sm'>S/R</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Simple / Resoluble</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Switch checked={isSolvable} onCheckedChange={setIsSolvable} />
      </div>
      <Button
        className={`p-2`}
        disabled={createComment ? createComment?.isLoading : false}
        type='submit'
      >
        {textSubmit}
      </Button>
    </form>
  );
};

export default CreateComment;
