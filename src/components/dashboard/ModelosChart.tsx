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
  NameType,
  Payload,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import { create } from 'zustand';

interface BarChartProps {
  data: {
    date: string;
    profiles: number;
  }[];
  className?: string;
}

export const modelosChartData = create<{
  data: { profiles: number; date: string }[];
}>(() => ({
  data: [],
}));

const ModelosChart = ({ data, className }: BarChartProps) => {
  const dataMostrar = useMemo(() => {
    return data.map((d) => {
      const [anio, mes, dia] = d.date.split('-');
      return {
        ...d,
        fecha: `${dia}/${mes}/${anio}`,
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
      <RechartChart id='modelosChart' data={dataMostrar} className='h-full'>
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
          dataKey='modelos'
          className='fill-slate-700'
          activeBar={<Rectangle stroke='black' />}
        />
      </RechartChart>
    </ResponsiveContainer>
  );
};

export default ModelosChart;

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
