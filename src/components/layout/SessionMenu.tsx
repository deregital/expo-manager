'use client';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';
import React from 'react';

interface SessionMenuProps {}

const SessionMenu = ({}: SessionMenuProps) => {
  const { data: session } = useSession();

  if (!session || !session.user) {
    return null;
  }

  return (
    <div className='flex items-center gap-x-4'>
      {session.user.username} {session.user.esAdmin ? ' (administrador)' : ''}
      <Button
        onClick={() =>
          signOut({
            redirect: true,
            callbackUrl: '/login',
          })
        }
      >
        Cerrar Sesión
      </Button>
    </div>
  );
};

export default SessionMenu;
