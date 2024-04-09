import SharedCard from '@/components/dashboard/SharedCard';
import { RouterOutputs } from '@/server';
import React from 'react';

interface RetencionCardProps {
  isLoading: boolean;
  modelos: RouterOutputs['modelo']['getByDateRange'] | undefined;
}

const RetencionCard = ({ isLoading, modelos }: RetencionCardProps) => {
  const modelosList = Object.values(modelos ?? {}).flatMap((m) => m);
  const retencion =
    (modelosList.filter((modelo) => modelo.aceptoContacto).length /
      modelosList.length) *
    100;

  return (
    <SharedCard
      title='Retención de modelos'
      content={
        isNaN(retencion)
          ? '0%'
          : retencion % 1 === 0
            ? `${retencion}%`
            : `${retencion.toFixed(2)}%`
      }
      isLoading={isLoading}
    />
  );
};

export default RetencionCard;
