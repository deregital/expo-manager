import { type NextRequest, NextResponse } from 'next/server';
import { fetchClient } from '@/server/fetchClient';
import { handleError } from '@/server/trpc';

export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();
  const password = body.password;

  if (!password)
    return new NextResponse('No se mandó ninguna contraseña', { status: 400 });

  const { data, error } = await fetchClient.POST('/csv/download-all-tables', {
    body: { password },
  });

  if (error) throw handleError(error);

  return new NextResponse(data);
}
