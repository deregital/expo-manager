'use client';

import { Calendar } from '@/components/ui/calendar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
export const HeatmapCalendarTickets = ({
  data,
}: {
  data: { date: string; count: number }[];
}) => {
  const total = data.reduce((total, date) => (total += date.count), 0);

  const getHSLColor = (ticketAmount: number) => {
    const percentage = ticketAmount / total;

    const hue = 130;
    const saturation = 75;
    const lightness = 90 - percentage * 60;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <TooltipProvider>
      <Calendar
        mode='single'
        locale={es}
        components={{
          Day: ({ date, ...props }) => {
            const match = data.find((d) => isSameDay(parseISO(d.date), date));

            const emmitedTickets = match?.count ?? 0;

            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    {...props}
                    style={{
                      backgroundColor: match
                        ? getHSLColor(match.count)
                        : undefined,
                      color: match && '#ffffff',
                    }}
                    className={`flex h-9 w-9 items-center justify-center rounded-md `}
                  >
                    {date.getDate()}
                  </div>
                </TooltipTrigger>
                {match && (
                  <TooltipContent>
                    <p>{emmitedTickets} tickets emitidos</p>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          },
        }}
      />
    </TooltipProvider>
  );
};
