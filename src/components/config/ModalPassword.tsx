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
  const [showPassword, setShowPassword] = useState(false);

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
          <div className='relative mb-4'>
            <input
              type={showPassword ? 'text' : 'password'}
              className='w-full rounded border p-2'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type='button'
              className='absolute inset-y-0 right-0 px-4 py-2 text-sm text-gray-600'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
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
