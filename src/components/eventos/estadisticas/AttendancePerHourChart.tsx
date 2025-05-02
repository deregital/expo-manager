'use client';

import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { format } from 'date-fns';

// const chartData = [
//   { hour: '16:00', scan: 17 },
//   { hour: '16:30', scan: 32 },
//   { hour: '17:00', scan: 67 },
//   { hour: '17:30', scan: 57 },
//   { hour: '18:00', scan: 47 },
//   { hour: '18:30', scan: 17 },
// ];

const chartConfig = {
  scan: {
    label: 'Escaneados',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export const AttendancePerHourChart = ({
  dates,
  starting,
  ending,
}: {
  dates: (string | null)[];
  starting: string;
  ending: string;
}) => {
  const startingDate = new Date(starting);
  const endingDate = new Date(ending);

  const chartData = getScansPerHalfHourFromDates(
    dates,
    startingDate,
    endingDate
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex justify-between'>
          Presentismo por hora
          <div className='flex gap-4'>
            <input
              type='time'
              name='start'
              value={format(startingDate, 'HH:mm')}
            />
            <input type='time' name='end' value={format(endingDate, 'HH:mm')} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className='h-48 w-full' config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              bottom: 8,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='time'
              tickLine={true}
              axisLine={true}
              tickMargin={16}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey='count'
              type='linear'
              stroke='#090014'
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

function getScansPerHalfHourFromDates(
  dateStrings: (string | null)[],
  start: Date,
  end: Date
): { time: string; count: number }[] {
  console.log(dateStrings);
  const counts: Record<string, number> = {};

  // Contar fechas por intervalos de 30 min
  for (const dateStr of dateStrings) {
    if (!dateStr) continue;
    const date = new Date(dateStr);
    const rounded = new Date(date);
    rounded.setMinutes(date.getMinutes() < 30 ? 0 : 30, 0, 0);

    const label = rounded.toTimeString().slice(0, 5); // HH:MM
    counts[label] = (counts[label] || 0) + 1;
  }

  // Generar todos los intervalos desde start hasta end
  const chartData: { time: string; count: number }[] = [];
  const cursor = new Date(start);
  cursor.setSeconds(0, 0); // limpiar segundos

  while (cursor <= end) {
    const label = cursor.toTimeString().slice(0, 5);
    chartData.push({
      time: label,
      count: counts[label] || 0,
    });
    cursor.setMinutes(cursor.getMinutes() + 30);
  }
  console.log(chartData);
  return chartData;
}
