import { type NextRequest } from 'next/server';
import { fetchClient } from '@/server/fetchClient';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return new Response('No se envió ninguna contraseña', { status: 400 });
    }

    // Llamada a la ruta de NestJS que expone el CSV
    const { data, error } = await fetchClient.POST('/csv/download-profiles', {
      body: {
        password,
      },
    });

    if (error) {
      return new Response('Error al generar el archivo', { status: 500 });
    }

    // Devolvemos el CSV como archivo descargable
    return new Response(data, {
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
