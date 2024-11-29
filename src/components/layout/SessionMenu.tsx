'use client';
import { Button } from '@/components/ui/button';
import { type Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import React from 'react';

interface SessionMenuProps {
  user: NonNullable<Session['user']>;
}

const SessionMenu = ({ user }: SessionMenuProps) => {
  return (
    <div className='flex items-center gap-x-4'>
      {user.username} {user.esAdmin ? ' (administrador)' : ''}
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
