import MensajeRecibido from '@/components/chat/privateChat/MensajeRecibido';
import TailWrapper from '@/components/chat/privateChat/TailWrapper';
import CheckIcon from '@/components/icons/CheckIcon';
import DoubleCheckIcon from '@/components/icons/DoubleCheckIcon';
import { cn } from '@/lib/utils';
import { RouterOutputs } from '@/server';
import { MessageJson, TextMessage } from '@/server/types/whatsapp';
import React, { useEffect, useMemo, useRef } from 'react';

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
  mensajes: RouterOutputs['whatsapp']['getMessagesByTelefono']['mensajes'];
}

const MensajesList = ({ mensajes }: MensajesListProps) => {
  const stateMessages = useMemo(() => {
    return addDateToMessages(mensajes);
  }, [mensajes]);

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
                  <span className='absolute bottom-0 end-0 pb-2 pe-2 text-[0.66rem] leading-[0.75rem] text-[#667781]'>
                    {messageDateTime.toLocaleTimeString().toLowerCase()}
                    {messageBody.to &&
                      (message.status === 'ENVIADO' ? (
                        <CheckIcon className='inline-block h-3 w-3' />
                      ) : (
                        <DoubleCheckIcon
                          className={cn(
                            'inline-block h-3 w-3',
                            message.status === 'RECIBIDO'
                              ? 'text-[#667781]'
                              : 'text-[#1e90ff]'
                          )}
                        />
                      ))}
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
