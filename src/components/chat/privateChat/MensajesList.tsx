import MensajeRecibido from '@/components/chat/privateChat/MensajeRecibido';
import TailWrapper from '@/components/chat/privateChat/TailWrapper';
import { RouterOutputs } from '@/server';
import { MessageJson, TextMessage } from '@/server/types/whatsapp';
import React, { useEffect, useRef, useState } from 'react';

type UIMessageModel = MensajesListProps['mensajes'][number] & {
  msgDate: string;
};

function addDateToMessages(
  withoutDateArray: MensajesListProps['mensajes']
): UIMessageModel[] {
  return withoutDateArray.map((messageWithoutDate) => {
    const withDate: UIMessageModel = {
      ...messageWithoutDate,
      msgDate: new Date(messageWithoutDate.created_at).toLocaleDateString(),
    };
    return withDate;
  });
}

interface MensajesListProps {
  from: string;
  mensajes: RouterOutputs['whatsapp']['getMessagesByTelefono']['mensajes'];
}

const MensajesList = ({ from, mensajes }: MensajesListProps) => {
  const [stateMessages] = useState<UIMessageModel[]>(
    addDateToMessages(mensajes)
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [stateMessages]);

  return (
    <div
      className='h-full w-full overflow-y-auto px-16 py-2'
      ref={messagesEndRef}
    >
      {stateMessages.map((message, index) => {
        const messageBody = message.message as MessageJson;
        const messageDateTime = new Date(message.created_at);

        return (
          <div key={message.id}>
            {(() => {
              if (
                index === 0
                  ? true
                  : message.msgDate !== stateMessages[index - 1].msgDate
              ) {
                return (
                  <div className='flex justify-center '>
                    <span className='rounded-md bg-white/95 p-2 text-sm text-[#54656f]'>
                      {message.msgDate}
                    </span>
                  </div>
                );
              }
            })()}
            <div className='my-1'>
              <TailWrapper
                showTail={
                  index === 0
                    ? true
                    : stateMessages[index].message.from !==
                      stateMessages[index - 1].message.from
                }
                isSent={!!messageBody.to}
              >
                <div className='relative flex flex-col items-end gap-1 px-2 pt-2'>
                  <div className='inline-block pb-2'>
                    {(() => {
                      switch (messageBody.type) {
                        case 'text':
                          return (
                            <MensajeRecibido
                              mensaje={messageBody as TextMessage}
                            />
                          );
                        default:
                          return <div>Unsupported message</div>;
                      }
                    })()}
                    <span className='invisible'>ww:ww wm</span>
                  </div>
                  <span className='absolute bottom-0 end-0 pb-2 pe-2 text-xs text-[#667781]'>
                    {messageDateTime.toLocaleTimeString().toLowerCase()}
                  </span>
                </div>
              </TailWrapper>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MensajesList;
