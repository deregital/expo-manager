import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

interface SharedCardProps {
  title: string;
  content: string;
  isLoading: boolean;
}

const SharedCard = ({ content, isLoading, title }: SharedCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={cn(isLoading && 'animate-pulse')}>
          Modelos participando
        </CardTitle>
      </CardHeader>

      <CardContent>
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
