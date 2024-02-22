'use client';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';
import React from 'react';

interface SessionMenuProps {}

const SessionMenu = ({}: SessionMenuProps) => {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <div className="flex items-center gap-x-4">
      {session?.user?.username}
      <Button onClick={() => signOut()}>Cerrar Sesión</Button>
    </div>
  );
};

export default SessionMenu;
