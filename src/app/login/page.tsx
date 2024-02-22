'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React from 'react';

const LoginPage = () => {
  async function handleLogin(formData: FormData) {
    const username = formData.get('username');
    const password = formData.get('password');

    await signIn('credentials', {
      username,
      password,
      callbackUrl: '/',
      redirect: true,
    });
  }

  const session = useSession();

  if (session.status === 'authenticated') {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans antialiased">
      <section className="w-full max-w-xl rounded-md border-2 border-slate-500/50 p-7">
        <form action={handleLogin} className="flex flex-col gap-4">
          <Input
            className="bg-white"
            type="text"
            name="username"
            id="username"
            placeholder="Nombre de Usuario"
          />
          <Input
            className="bg-white"
            type="text"
            name="password"
            id="password"
            placeholder="Contraseña"
          />
          <Button type="submit">Log In</Button>
        </form>
      </section>
    </div>
  );
};

export default LoginPage;
