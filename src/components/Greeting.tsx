'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { signIn, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import EtiquetaModal from './etiquetas/modal/EtiquetaModal';
import GrupoEtiquetaModal from './etiquetas/modal/GrupoEtiquetaModal';


const Greeting = () => {
  const session = useSession();

  const [search, setSearch] = useState<string | undefined>('');
  const [contenido, setContenido] = useState<string>('');
  const [perfilId, setPerfilId] = useState<string>(''); // State para el perfilId
  const utils = trpc.useUtils();
  const { data: etiquetas } = trpc.modelo.getAll.useQuery();

  useEffect(() => {
    if (search) {
      utils.etiqueta.getByNombre.refetch(search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const { isLoading } = trpc.grupoEtiqueta.getAll.useQuery();

  const sendMessage = trpc.whatsapp.sendMessage.useMutation();

  const createComentario = trpc.comentario.create.useMutation();

  async function send() {
    sendMessage.mutateAsync({
      etiquetas: [
        '14d603e9-ade8-4c05-a5c0-250ef1e269c9',
        '6e438455-fc82-4f29-9e7a-c8023f3298e6',
      ],
      plantillaName: 'agradecimiento',
    });
  }

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

  // Función que maneja el envío de comentario
  async function handleSendComment() {
    await createComentario.mutateAsync({
      contenido,
      perfilId,
    });

    // Limpio los campos después de enviar el comentario
    setContenido('');
    setPerfilId('');
  }

  return (
    <>
      <div className='flex flex-col gap-4'>
        {session.data ? (
          <>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} />
            <p>Welcome, {session.data.user?.username}</p>
            {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
            <Button onClick={send}>Send</Button>
            {isLoading ? <p>Loading...</p> : <EtiquetaModal action='CREATE' />}
            <GrupoEtiquetaModal action='EDIT' />
            <Input
              value={perfilId}
              onChange={(e) => setPerfilId(e.target.value)}
              placeholder='Perfil ID'
            />
            <Input
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder='Comentario'
            />
            <Button onClick={handleSendComment}>Send Comment</Button>
            <pre>{JSON.stringify(etiquetas, null, 2)}</pre>
          </>
        ) : (
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
              type='text'
              name='password'
              id='password'
              placeholder='Contraseña'
            />
            <Button type='submit'>Log In</Button>
          </form>
        )}
      </div>
    </>
  );
};

export default Greeting;
