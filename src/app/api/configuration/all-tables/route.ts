import { type NextRequest, NextResponse } from 'next/server';
import { fetchClient } from '@/server/fetchClient';

export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();
  const password = body.password;

  if (!password)
    return new NextResponse('No se mandó ninguna contraseña', { status: 400 });

  try {
    const { response, error } = await fetchClient.POST(
      '/csv/download-all-tables',
      {
        body: { password },
        parseAs: 'stream',
      }
    );

    if (error) {
      return NextResponse.json(error.message[0], { status: error.statusCode });
    }

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=backup.zip',
      },
    });
  } catch (error) {
    console.log('Error al descargar ZIP:', error);

    return new NextResponse('Ocurrió un error al procesar la solicitud', {
      status: 500,
    });
  }
}
