import React, { ReactElement } from 'react';
import TailIn from '@/components/icons/TailIn';

const TailWrapper = ({
  children,
  showTail,
  isSent,
}: {
  children: ReactElement;
  showTail: boolean;
  isSent: boolean;
}) => {
  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
      <div className='flex'>
        {showTail && !isSent ? (
          <div
            className={`inline-block h-full ${isSent ? 'text-[#D9FDD3]' : 'text-white'} float-left`}
          >
            <TailIn />
          </div>
        ) : (
          <div className='inline-block w-[8px]'></div>
        )}
        <div
          className={`${isSent ? 'bg-[#D9FDD3]' : 'bg-white'} inline-block rounded-b-lg  ${showTail ? (isSent ? 'rounded-tl-lg' : 'rounded-tr-lg') : 'rounded-t-lg'} shadow-message`}
        >
          {children}
        </div>
        {showTail && isSent ? (
          <div
            className={`inline-block h-full ${isSent ? 'text-[#D9FDD3]' : 'text-white'} float-right scale-x-[-1]`}
          >
            <TailIn />
          </div>
        ) : (
          <div className='inline-block w-[8px]'></div>
        )}
      </div>
    </div>
  );
};

export default TailWrapper;
