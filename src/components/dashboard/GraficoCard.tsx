import ModelosChart from '@/components/dashboard/ModelosChart';
import { Card } from '@/components/ui/card';
import Loader from '@/components/ui/loader';
import React from 'react';

interface GraficoCardProps {
  modelos: {
    fecha: string;
    modelos: number;
  }[];
  isLoading: boolean;
}

const GraficoCard = ({ modelos, isLoading }: GraficoCardProps) => {
  return (
    <Card className='flex h-full min-h-48 items-center justify-center sm:min-h-max'>
      {isLoading ? (
        <Loader />
      ) : Object.values(modelos).some((modelo) => modelo.modelos > 0) ? (
        <ModelosChart data={modelos} className='min-h-48 p-2' />
      ) : (
        <div className='flex h-full items-center justify-center'>
          <p className='text-2xl text-slate-500'>No hay datos para mostrar</p>
        </div>
      )}
    </Card>
  );
};

export default GraficoCard;
