import { type TextMessage } from '@/server/types/whatsapp';
import React from 'react';

interface MessageReceivedProps {
  mensaje: TextMessage;
}

const MessageReceived = ({ mensaje }: MessageReceivedProps) => {
  return <>{mensaje.text.body}</>;
};

export default MessageReceived;
