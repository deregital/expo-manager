'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { signIn, signOut, useSession } from 'next-auth/react';
import React from 'react';

const Greeting = () => {
  const session = useSession();
  const { data } = trpc.perfil.getById.useQuery(
    '009e92a1-0f95-42f3-91e7-f88725c1e3f3'
  );

  console.log(data);

  async function handleLogin(formData: FormData) {
    const username = formData.get('username');
    const password = formData.get('password');

    await signIn('credentials', {
      username,
      password,
      callbackUrl: '/',
      redirect: false,
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {session.data ? (
          <>
            <p>Welcome, {session.data.user?.username}</p>
            <Button
              variant={'destructive'}
              onClick={() => {
                signOut({
                  redirect: false,
                });
              }}
            >
              Log Out
            </Button>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </>
        ) : (
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
        )}
      </div>
    </>
  );
};

export default Greeting;
