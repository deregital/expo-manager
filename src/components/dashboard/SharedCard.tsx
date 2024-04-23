import InfoPopover from '@/components/dashboard/InfoPopover';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

interface SharedCardProps {
  title: string;
  content: string;
  isLoading: boolean;
  popoverText: string;
}

const SharedCard = ({
  content,
  isLoading,
  title,
  popoverText,
}: SharedCardProps) => {
  return (
    <Card className='relative'>
      <CardHeader>
        <CardTitle className={cn(isLoading && 'animate-pulse')}>
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className='absolute right-2 top-2'>
          <InfoPopover text={popoverText} />
        </div>

        <p
          className={cn(
            'text-3xl font-extrabold',
            isLoading && 'animate-pulse'
          )}
        >
          {content}
        </p>
      </CardContent>
    </Card>
  );
};

export default SharedCard;
