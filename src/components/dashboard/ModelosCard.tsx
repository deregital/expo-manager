import SharedCard from '@/components/dashboard/SharedCard';
import { RouterOutputs } from '@/server';
import React from 'react';

interface ModelosCardProps {
  modelos: RouterOutputs['modelo']['getByDateRange'] | undefined;
  isLoading: boolean;
}

const ModelosCard = ({ modelos, isLoading }: ModelosCardProps) => {
  const cantidad = Object.values(modelos ?? {}).flatMap((m) => m).length;

  return (
    <SharedCard
      title='Modelos'
      content={cantidad.toString()}
      isLoading={isLoading}
    />
  );
};

export default ModelosCard;
