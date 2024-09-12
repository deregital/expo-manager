import { cn, getTextColorByBg } from '@/lib/utils';
import { Button } from './button';
import EtiquetasFillIcon from '../icons/EtiquetasFillIcon';
import EtiquetaFillIcon from '../icons/EtiquetaFillIcon';
import { Filtro } from '@/lib/filter';

const ShowEtiqueta = ({
  etiqueta,
  wFullMobile = false,
  buttonClassName,
  buttonStyle,
}: {
  etiqueta: NonNullable<
    Filtro['etiquetas'][0]['etiqueta'] | Filtro['grupos'][0]['grupo']
  >;
  wFullMobile?: boolean;
  buttonClassName?: string;
  buttonStyle?: React.CSSProperties;
}) => {
  const isGrupo = 'color' in etiqueta;
  return (
    <Button
      variant='outline'
      className={cn(
        'w-[200px] justify-between',
        wFullMobile && 'w-full md:w-[200px]',
        buttonClassName
      )}
      style={
        isGrupo
          ? {
              backgroundColor: etiqueta.color,
              color: getTextColorByBg(etiqueta.color ?? '#ffffff'),
              ...buttonStyle,
            }
          : buttonStyle
      }
    >
      <>
        <span className='max-w-[calc(100%-30px)] flex-1 truncate'>
          {etiqueta.nombre}
        </span>
        {isGrupo ? (
          <EtiquetasFillIcon className='h-5 w-5' />
        ) : (
          <EtiquetaFillIcon className='h-5 w-5' />
        )}
      </>
    </Button>
  );
};

export default ShowEtiqueta;
