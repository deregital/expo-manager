import { getServerAuthSession } from '@/server/auth';
import { redirect } from 'next/navigation';

const CheckIfUserIsAuthenticated = async () => {
  const session = await getServerAuthSession();
  if (!session || !session.user) {
    return redirect('/login');
  }
  return null;
};

export default CheckIfUserIsAuthenticated;
