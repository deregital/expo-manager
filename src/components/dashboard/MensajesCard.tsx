import SharedCard from '@/components/dashboard/SharedCard';
import React from 'react';

interface MensajesCardProps {
  cantMensajes: number;
  isLoading: boolean;
}

const MensajesCard = ({ cantMensajes, isLoading }: MensajesCardProps) => {
  return (
    <SharedCard
      popoverText='Cantidad de mensajes enviados'
      title='Mensajes enviados'
      content={cantMensajes.toString()}
      isLoading={isLoading}
    />
  );
};

export default MensajesCard;
