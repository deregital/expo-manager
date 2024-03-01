'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { signIn, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

const Greeting = () => {
  const session = useSession();

  const [search, setSearch] = useState<string | undefined>('');
  const utils = trpc.useUtils();
  const { data: etiquetas } = trpc.etiqueta.getByNombre.useQuery(search);

  useEffect(() => {
    if (search) {
      utils.etiqueta.getByNombre.refetch(search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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
            <Input value={search} onChange={(e) => setSearch(e.target.value)} />
            <p>Welcome, {session.data.user?.username}</p>
            <pre>{JSON.stringify(etiquetas, null, 2)}</pre>
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
