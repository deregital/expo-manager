'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
  label: {
    color: 'hsl(var(--background))',
  },
} satisfies ChartConfig;

interface AttendanceChartProps {
  data?: Record<string, number | undefined>;
}

export const AttendanceChartSpecific = ({ data }: AttendanceChartProps) => {
  if (!data) {
    return (
      <Card className='flex h-full items-center justify-center'>
        <CardContent>No hay datos disponibles de tickets emitidos</CardContent>
      </Card>
    );
  }
  const chartData = Object.entries(data).map(([type, count]) => ({
    type,
    count,
    mobile: 10,
  }));

  return (
    <>
      <Card>
        <CardHeader className='mb-0 pb-0'>
          <CardTitle>Tickets emitidos por tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer className='h-36 w-full' config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              layout='vertical'
              barSize={26}
              margin={{
                right: 24,
              }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey='type'
                type='category'
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                hide
              />
              <XAxis dataKey='count' type='number' hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator='line' />}
              />
              <Bar
                dataKey='count'
                layout='vertical'
                fill='var(--color-desktop)'
                radius={4}
              >
                <LabelList
                  dataKey='type'
                  position='insideLeft'
                  offset={8}
                  className='fill-[--color-label]'
                  fontSize={12}
                />
                <LabelList
                  dataKey='count'
                  position='right'
                  offset={8}
                  className='fill-foreground'
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
};
