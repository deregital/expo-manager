'use client';
import React from 'react';
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
    fecha: string;
    modelos: number;
  }[];
}

export const modelosChartData = create<{
  data: { modelos: number; fecha: string }[];
}>(() => ({
  data: [],
}));

const ModelosChart = ({ data }: BarChartProps) => {
  const error = console.error;
  console.error = (...args: any) => {
    if (/defaultProps/.test(args[0])) return;
    error(...args);
  };
  return (
    <ResponsiveContainer width={'100%'} aspect={3}>
      <RechartChart id='modelosChart' data={data}>
        <XAxis dataKey='fecha' />
        <YAxis />
        <Tooltip
          content={({ active, payload, label }) => (
            <CustomTooltip
              text={'Modelos creadas'}
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
