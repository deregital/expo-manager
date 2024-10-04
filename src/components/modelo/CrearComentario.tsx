import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface CrearComentarioProps {
  handleAddComentario: (e: React.FormEvent<HTMLFormElement>) => void;
  esResoluble: boolean;
  setEsResoluble: (esResoluble: boolean) => void;
  createComentario?: {
    isLoading: boolean;
  };
  type: 'creacion_participante' | 'vista_particular';
}
const CrearComentario = ({
  handleAddComentario,
  esResoluble,
  setEsResoluble,
  createComentario,
  type,
}: CrearComentarioProps) => {
  return (
    <form
      onSubmit={handleAddComentario}
      className='flex items-end gap-x-4 rounded-lg bg-gray-300 px-3 pb-3 pt-2'
    >
      <Input
        autoComplete='off'
        name='comentario'
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
        <Switch checked={esResoluble} onCheckedChange={setEsResoluble} />
      </div>
      <Button
        className={`${type === 'creacion_participante' ? 'p-2' : ''}`}
        disabled={
          type === 'vista_particular' ? createComentario?.isLoading : false
        }
        type='submit'
      >
        {type === 'creacion_participante' ? '+' : 'Enviar'}
      </Button>
    </form>
  );
};

export default CrearComentario;
