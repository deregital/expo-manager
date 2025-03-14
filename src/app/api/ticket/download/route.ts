import { fetchClient } from '@/server/fetchClient';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();
  const ticketId = body.id;

  try {
    const { response, error } = await fetchClient.GET(
      '/ticket/generate-pdf/{id}',
      {
        params: {
          path: {
            id: ticketId,
          },
        },
        parseAs: 'stream',
      }
    );

    if (error) {
      return new NextResponse(error.message[0], { status: error.statusCode });
    }

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=ticket-${ticketId}.zip`,
      },
    });
  } catch (error) {
    console.log('Error al descargar ticket:', error);

    return new NextResponse('Ocurrió un error al procesar la solicitud', {
      status: 500,
    });
  }
}
