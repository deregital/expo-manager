'use client';
import { cn } from '@/lib/utils';
import React, { useMemo } from 'react';
import {
  Bar,
  Rectangle,
  Tooltip,
  XAxis,
  YAxis,
  BarChart as RechartChart,
  ResponsiveContainer,
} from 'recharts';
import {
  type NameType,
  type Payload,
  type ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import { create } from 'zustand';

interface BarChartProps {
  data: {
    date: string;
    profiles: number;
  }[];
  className?: string;
}

export const profilesChartData = create<{
  data: { profiles: number; date: string }[];
}>(() => ({
  data: [],
}));

const ProfilesChart = ({ data, className }: BarChartProps) => {
  const dataToShow = useMemo(() => {
    return data.map((d) => {
      const [year, month, day] = d.date.split('-');
      return {
        ...d,
        fecha: `${day}/${month}/${year}`,
      };
    });
  }, [data]);

  const error = console.error;
  console.error = (...args: any) => {
    if (/defaultProps/.test(args[0])) return;
    error(...args);
  };

  return (
    <ResponsiveContainer
      height={'100%'}
      width={'100%'}
      className={cn(className)}
    >
      <RechartChart id='modelosChart' data={dataToShow} className='h-full'>
        <XAxis dataKey={'fecha'} />
        <YAxis />
        <Tooltip
          content={({ active, payload, label }) => (
            <CustomTooltip
              text={'Participantes creados'}
              active={active}
              payload={payload}
              label={label}
            />
          )}
        />
        <Bar
          dataKey='profiles'
          className='fill-slate-700'
          activeBar={<Rectangle stroke='black' />}
        />
      </RechartChart>
    </ResponsiveContainer>
  );
};

export default ProfilesChart;

const CustomTooltip = ({
  active,
  payload,
  label,
  text,
}: {
  active?: boolean;
  payload?: Payload<ValueType, NameType>[] | undefined;
  label?: string;
  text: string;
}) => {
  return (
    active &&
    payload &&
    payload.length && (
      <div className='rounded-md bg-white/90 p-2 shadow-sm drop-shadow-lg'>
        <p>{label}</p>
        <p>
          {text}: {payload[0].value}
        </p>
      </div>
    )
  );
};
