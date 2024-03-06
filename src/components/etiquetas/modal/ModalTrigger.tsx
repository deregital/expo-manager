import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';

interface ModalTriggerProps {
  action: 'CREATE' | 'EDIT';
  children: [
    React.ReactElement<ButtonCreateProps>,
    React.ReactElement<ButtonEditProps>,
  ];
}

const ModalTrigger = React.forwardRef<HTMLDivElement, ModalTriggerProps>(
  ({ action, children }, _ref) => {
    if (
      children[0].type !== ModalTriggerCreate ||
      children[1].type !== ModalTriggerEdit
    ) {
      console.error(
        'ModalTrigger children must be ModalTriggerCreate and ModalTriggerEdit, in that order'
      );
      return null;
    }
    return <>{action === 'CREATE' ? children[0] : children[1]}</>;
  }
);

ModalTrigger.displayName = 'ModalTrigger';
export default ModalTrigger;

interface ButtonCreateProps {
  children: React.ReactNode;
  onClick: () => void;
}

export const ModalTriggerCreate = ({
  children,
  onClick,
}: ButtonCreateProps) => {
  return (
    <Button
      className='rounded-md bg-gray-400 px-5 py-0.5 text-gray-950 hover:bg-gray-300'
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
