import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';

interface ButtonCreateProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export const ModalTriggerCreate = ({
  children,
  onClick,
  className,
}: ButtonCreateProps) => {
  return (
    <Button
      className={cn(
        'rounded-md bg-gray-400 px-5 py-0.5 text-gray-950 hover:bg-gray-300',
        className
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

interface ButtonEditProps {
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

export const ModalTriggerEdit = ({ children, onClick }: ButtonEditProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        buttonVariants({
          variant: 'ghost',
        }),
        'flex h-fit cursor-pointer items-center rounded-full p-0.5'
      )}
    >
      {children}
    </div>
  );
};
