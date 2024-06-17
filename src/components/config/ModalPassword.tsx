'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { FormEvent, PropsWithChildren, useState } from 'react';

interface ModalPasswordProps {
  onSubmit: (password: string) => void;
  handleOpenModal: () => void;
  handleCloseModal: () => void;
  isModalOpen: boolean;
}

const ModalPassword = ({
  onSubmit,
  handleCloseModal,
  handleOpenModal,
  isModalOpen,
  children,
}: PropsWithChildren<ModalPasswordProps>) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  const handleClose = () => {
    setPassword('');
    handleCloseModal();
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleCloseModal();
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          onClick={handleOpenModal}
          className='cursor-pointer rounded bg-blue-500 px-4 py-2 text-lg font-bold text-white shadow-md transition duration-300 hover:bg-blue-600'
        >
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className='min-h-40' onCloseAutoFocus={handleClose}>
        <div className='h-full w-full bg-white'>
          <h2 className='mb-4 text-2xl'>Ingresa tu contraseña</h2>
          <form onSubmit={handleSubmit}>
            <div className='relative mb-4'>
              <input
                type={showPassword ? 'text' : 'password'}
                className='w-full rounded border p-2'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                variant={'ghost'}
                type='button'
                className='absolute inset-y-0 right-0 px-4 py-2 text-sm text-gray-600 hover:bg-transparent'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>
            <div className='flex justify-end'>
              <button
                type='button'
                className='mr-4 rounded bg-gray-300 px-4 py-2'
                onClick={handleClose}
              >
                Cancelar
              </button>
              <Button
                type='submit'
                className='rounded bg-blue-500 px-4 py-2 text-white'
              >
                Confirmar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalPassword;
