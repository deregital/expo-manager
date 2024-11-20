import { type TextMessage } from '@/server/types/whatsapp';
import React from 'react';

interface MensajeRecibidoProps {
  mensaje: TextMessage;
}

const MensajeRecibido = ({ mensaje }: MensajeRecibidoProps) => {
  return <>{mensaje.text.body}</>;
};

export default MensajeRecibido;
