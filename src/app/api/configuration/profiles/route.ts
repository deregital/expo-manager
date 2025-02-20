import { NextResponse, type NextRequest } from 'next/server';
import { fetchClient } from '@/server/fetchClient';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return new Response('No se envió ninguna contraseña', { status: 400 });
    }

    // Llamada a la ruta de NestJS que expone el CSV
    const { error, response } = await fetchClient.POST(
      '/csv/download-profiles',
      {
        body: {
          password,
        },
        parseAs: 'stream',
      }
    );

    if (error) {
      return NextResponse.json(error.message[0], { status: error.statusCode });
    }

    // Devolvemos el CSV como archivo descargable
    return new NextResponse(await response.blob(), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=PerfilModelos.csv',
      },
    });
  } catch (error) {
    return new Response('Ocurrió un error al procesar la solicitud', {
      status: 500,
    });
  }
}
