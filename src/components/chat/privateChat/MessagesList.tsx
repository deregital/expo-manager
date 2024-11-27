import MensajeRecibido from '@/components/chat/privateChat/MessageReceived';
import TailWrapper from '@/components/chat/privateChat/TailWrapper';
import CheckIcon from '@/components/icons/CheckIcon';
import DoubleCheckIcon from '@/components/icons/DoubleCheckIcon';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { type RouterOutputs } from '@/server';
import {
  type MessageJson,
  type TemplateMessage,
  type TextMessage,
} from '@/server/types/whatsapp';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type UIMessageModel = MessagesListProps['messages'][number] & {
  msgDate: string;
};

function addDateToMessages(
  withoutDateArray: MessagesListProps['messages']
): UIMessageModel[] {
  return withoutDateArray.map((messageWithoutDate) => {
    const withDate: UIMessageModel = {
      ...messageWithoutDate,
      msgDate: new Date(messageWithoutDate.created_at).toLocaleDateString(),
    };
    return withDate;
  });
}

interface MessagesListProps {
  messages: RouterOutputs['message']['findMessagesByPhone']['messages'];
  phone: string;
}

const MessagesList = ({ messages, phone }: MessagesListProps) => {
  const [lastMessageSent, setLastMessageSent] = useState(Date.now());
  const utils = trpc.useUtils();
  const stateMessages = useMemo(() => {
    return addDateToMessages(messages);
  }, [messages]);

  trpc.message.getLastMessageTimestamp.useQuery(phone, {
    enabled: !!phone,
    refetchInterval: 1000,
    onSuccess: (data) => {
      if (data.timestamp !== lastMessageSent) {
        setLastMessageSent(data.timestamp);
        utils.message.findMessagesByPhone.invalidate(phone);
      }
    },
  });

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
      className='h-full w-full overflow-y-auto px-3 py-2 sm:px-16'
      ref={messagesEndRef}
    >
      {stateMessages.map((message, index) => {
        const messageBody = message.message as MessageJson;
        const messageDateTime = new Date(message.created_at);

        return (
          <div key={message.message.id}>
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
            <div
              className={cn(
                'my-1 flex',
                !!messageBody.to ? 'justify-end' : 'justify-start'
              )}
            >
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
                        case 'template':
                          return (
                            <Link
                              className='text-blue-500 hover:underline'
                              href={`/plantilla/${(messageBody as TemplateMessage).templateName}`}
                            >
                              {`Plantilla ${messageBody.type === 'template' && (messageBody as TemplateMessage).templateName}`}
                            </Link>
                          );
                        default:
                          return <div>Mensaje no soportado</div>;
                      }
                    })()}
                    <span className='invisible'>ww:ww wm</span>
                  </div>
                  <span className='absolute bottom-0 end-0 pb-2 pe-2 text-[0.66rem] leading-[0.75rem] text-[#667781]'>
                    {messageDateTime.toLocaleTimeString().toLowerCase()}
                    {messageBody.to &&
                      (message.state === 'SENT' ? (
                        <CheckIcon className='inline-block h-3 w-3' />
                      ) : (
                        <DoubleCheckIcon
                          className={cn(
                            'inline-block h-3 w-3',
                            message.state === 'RECEIVED'
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

export default MessagesList;
