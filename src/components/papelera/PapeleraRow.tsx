import TrashCanButtons from '@/components/papelera/BotonesPapelera';
import FotoModelo from '@/components/ui/FotoModelo';
import { RouterOutputs } from '@/server';
import { format } from 'date-fns';
import Link from 'next/link';

interface PapeleraRowProps {
  modelo: RouterOutputs['modelo']['getModelosPapelera'][number];
}

const PapeleraRow = ({ modelo }: PapeleraRowProps) => {
  return (
    <Link
      href={`/modelo/${modelo.id}`}
      key={modelo.id}
      className='flex items-center justify-between gap-x-4 px-3 py-2 hover:bg-gray-200'
    >
      <div className='flex w-full items-center gap-x-2.5 truncate'>
        <FotoModelo url={modelo.fotoUrl ?? ''} />
        <p className='w-full truncate py-1'>{modelo.nombreCompleto}</p>
      </div>
      <div className='flex gap-x-4'>
        <div className='hidden w-fit flex-col items-end sm:flex'>
          <span className='text-sm text-gray-500'>{modelo.telefono}</span>
          {modelo.fechaPapelera && (
            <span className='whitespace-nowrap text-sm text-gray-500'>
              En papelera desde:{' '}
              {format(new Date(modelo.fechaPapelera), 'dd/MM/yyyy')}
            </span>
          )}
        </div>
        <TrashCanButtons id={modelo.id} isInTrash={true} />
      </div>
    </Link>
  );
};

export default PapeleraRow;
