'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState } from 'react';

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(formData: FormData) {
    const username = formData.get('username');
    const password = formData.get('password');

    const res = await signIn('credentials', {
      username,
      password,
      callbackUrl: '/',
      redirect: false,
    });

    if (res?.ok) {
      setError(null);
      redirect('/');
    }

    if (res?.status === 401) {
      setError('Credenciales inválidas');
    }
  }

  return (
    <>
      <legend className='mb-4 text-center'>
        <h1 className='text-3xl font-bold text-slate-900'>Iniciar Sesión</h1>
      </legend>
      <fieldset className='w-full max-w-[calc(100%-16px)] rounded-md border-2 border-slate-500/50 p-7 pb-4 lg:max-w-xl'>
        <form action={handleLogin} className='flex flex-col gap-4'>
          <Input
            className='bg-white'
            type='text'
            name='username'
            id='username'
            placeholder='Nombre de Usuario'
          />
          <Input
            className='bg-white'
            type='password'
            name='password'
            id='password'
            placeholder='Contraseña'
          />
          <Button type='submit'>Log In</Button>
        </form>
        {error && (
          <p className='mt-2 text-sm font-bold text-red-500'>{error}</p>
        )}
      </fieldset>
    </>
  );
};

export default LoginPage;
