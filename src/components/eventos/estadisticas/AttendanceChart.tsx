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
const chartData = [
  { month: 'Staff', desktop: 186, mobile: 80 },
  { month: 'Participant', desktop: 305, mobile: 200 },
  { month: 'Spectator', desktop: 237, mobile: 120 },
];

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

export const AttendanceChart = () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Asistencia Total</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer className='h-36 w-full' config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              layout='vertical'
              barSize={32}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey='month'
                type='category'
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                hide
              />
              <XAxis dataKey='desktop' type='number' hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator='line' />}
              />
              <Bar
                dataKey='desktop'
                layout='vertical'
                fill='var(--color-desktop)'
                radius={4}
              >
                <LabelList
                  dataKey='month'
                  position='insideLeft'
                  offset={8}
                  className='fill-[--color-label]'
                  fontSize={12}
                />
                <LabelList
                  dataKey='desktop'
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
