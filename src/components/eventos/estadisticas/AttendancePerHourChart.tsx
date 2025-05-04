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
          <div className='flex gap-4 text-base md:text-lg'>
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
              name='Escaneados'
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
  const counts: Record<string, number> = {};
  const minuteLap = 30;
  for (const dateStr of dateStrings) {
    if (dateStr) {
      const date = new Date(dateStr);
      const rounded = new Date(date);
      rounded.setMinutes(date.getMinutes() < minuteLap ? 0 : minuteLap, 0, 0);

      const label = rounded.toTimeString().slice(0, 5); // HH:MM
      counts[label] = (counts[label] || 0) + 1;
    }
  }

  const chartData: { time: string; count: number }[] = [];
  const current = new Date(start);
  current.setSeconds(0, 0);

  while (current <= end) {
    const label = current.toTimeString().slice(0, 5);
    chartData.push({
      time: label,
      count: counts[label] || 0,
    });
    current.setMinutes(current.getMinutes() + minuteLap);
  }
  return chartData;
}
