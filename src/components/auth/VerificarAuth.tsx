'use client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

// VER SI HAY OTRA MANERA DE HACERLO
const CheckIfUserIsAuthenticated = () => {
  const session = useSession();
  if (session.status === 'unauthenticated') {
    return redirect('/login');
  }
  return null;
};

export default CheckIfUserIsAuthenticated;
