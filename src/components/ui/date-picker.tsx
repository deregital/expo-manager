import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { type SelectSingleEventHandler } from 'react-day-picker';
import { es } from 'date-fns/locale';

export const DatePicker = ({
  value,
  onChange,
  min,
}: {
  value?: Date;
  onChange: SelectSingleEventHandler;
  min?: Date;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon />
          {value ? (
            format(value, 'PPP', { locale: es })
          ) : (
            <span>Elegí una fecha</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          disabled={(date) => {
            if (!min) return false;
            return date < min;
          }}
          locale={es}
          mode='single'
          selected={value ? value : undefined}
          onSelect={(e, ...props) => {
            if (!e) return;
            onChange(e, ...props);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
