import { cn, getTextColorByBg } from '@/lib/utils';
import { Button } from './button';
import EtiquetasFillIcon from '../icons/EtiquetasFillIcon';
import EtiquetaFillIcon from '../icons/EtiquetaFillIcon';
import { type Filtro } from '@/lib/filter';

const ShowEtiqueta = ({
  tag,
  wFullMobile = false,
  buttonClassName,
  buttonStyle,
}: {
  tag: NonNullable<Filtro['tags'][0]['tag'] | Filtro['groups'][0]['group']>;
  wFullMobile?: boolean;
  buttonClassName?: string;
  buttonStyle?: React.CSSProperties;
}) => {
  const isGroup = 'color' in tag;
  return (
    <Button
      variant='outline'
      className={cn(
        'w-[200px] justify-between',
        wFullMobile && 'w-full md:w-[200px]',
        buttonClassName
      )}
      style={
        isGroup
          ? {
              backgroundColor: tag.color,
              color: getTextColorByBg(tag.color ?? '#ffffff'),
              ...buttonStyle,
            }
          : buttonStyle
      }
    >
      <>
        <span className='max-w-[calc(100%-30px)] flex-1 truncate'>
          {tag.name ?? ''}
        </span>
        {isGroup ? (
          <EtiquetasFillIcon className='h-5 w-5' />
        ) : (
          <EtiquetaFillIcon className='h-5 w-5' />
        )}
      </>
    </Button>
  );
};

export default ShowEtiqueta;
