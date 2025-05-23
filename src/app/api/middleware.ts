import { getServerAuthSession } from '@/server/auth';
import { type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    throw new Error('No se encontró una sesión');
  }
}

export const config = {
  matcher: '/api/image/:path*',
};
