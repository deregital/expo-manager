import React from 'react';
import {
  Bar,
  Rectangle,
  Tooltip,
  XAxis,
  YAxis,
  BarChart as RechartChart,
} from 'recharts';
import { create } from 'zustand';

interface BarChartProps {
  data: {
    fecha: string;
    modelos: number;
  }[];
}

export const modelosData = create<{
  data: { modelos: number; fecha: string }[];
}>(() => ({
  data: [],
}));

const BarChart = ({ data }: BarChartProps) => {
  return (
    <RechartChart data={data} width={500} height={300}>
      <XAxis dataKey='fecha' />
      <YAxis />
      <Tooltip />
      <Bar
        dataKey='modelos'
        className='fill-slate-700'
        activeBar={<Rectangle fill='pink' stroke='blue' />}
      />
    </RechartChart>
  );
};

export default BarChart;
