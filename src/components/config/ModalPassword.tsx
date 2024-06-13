'use client';
import { FormEvent, useState } from 'react';

interface ModalPasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
}

const ModalPassword: React.FC<ModalPasswordProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-80 rounded bg-white p-6 shadow-md'>
        <h2 className='mb-4 text-2xl'>Ingresa tu contraseña</h2>
        <form onSubmit={handleSubmit}>
          <input
            type='password'
            className='mb-4 w-full rounded border p-2'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className='flex justify-end'>
            <button
              type='button'
              className='mr-4 rounded bg-gray-300 px-4 py-2'
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='rounded bg-blue-500 px-4 py-2 text-white'
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPassword;
