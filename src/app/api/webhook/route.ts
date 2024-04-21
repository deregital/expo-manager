import { verifyWebhook } from '@/lib/verify';
import { ReceivedMessage, WebHookRequest } from '@/server/types/webhooks';
import { headers } from 'next/headers';
import { prisma } from '@/server/db';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request: Request) {
  const urlDecoded = new URL(request.url);
  const urlParams = urlDecoded.searchParams;
  let mode = urlParams.get('hub.mode');
  let token = urlParams.get('hub.verify_token');
  let challenge = urlParams.get('hub.challenge');
  if (mode && token && challenge && mode == 'subscribe') {
    const isValid = token == process.env.WEBHOOK_VERIFY_TOKEN;
    if (isValid) {
      return new NextResponse(challenge);
    } else {
      return new NextResponse(null, { status: 403 });
    }
  } else {
    return new NextResponse(null, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const headersList = headers();
  const xHubSigrature256 = headersList.get('x-hub-signature-256');
  const rawRequestBody = await request.text();
  if (!xHubSigrature256 || !verifyWebhook(rawRequestBody, xHubSigrature256)) {
    console.warn(`Invalid signature : ${xHubSigrature256}`);
    return new NextResponse(null, { status: 401 });
  }
  const webhookBody = JSON.parse(rawRequestBody) as WebHookRequest;

  try {
    if (webhookBody.entry.length > 0) {
      const changes = webhookBody.entry[0].changes;

      if (changes.length > 0) {
        if (changes[0].field === 'messages') {
          const value = changes[0].value;
          if ('messages' in value) {
            await crearMensaje(value);
          } else if ('statuses' in value) {
            // Manejar status después de haber creado el mensaje en la base
          }
        }
      }
    }
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(null, { status: 500 });
  }
}

async function crearMensaje(value: ReceivedMessage) {
  const message = value.messages[0];
  const contact = value.contacts[0];

  const etiquetaTentativaId = await prisma.etiqueta.findFirst({
    where: {
      tipo: 'TENTATIVA',
    },
    select: {
      id: true,
    },
  });

  if (!etiquetaTentativaId) {
    throw new Error('No se encontró la etiqueta TENTATIVA');
  }

  if (message && message.type === 'text') {
    return await prisma.mensaje.create({
      data: {
        wamId: message.id,
        deliveredAt: new Date(Number.parseInt(message.timestamp) * 1000),
        message: message,
        perfil: {
          connectOrCreate: {
            where: {
              telefono: message.from,
            },
            create: {
              nombreCompleto: contact.profile.name,
              telefono: contact.wa_id,
              etiquetas: {
                connect: {
                  id: etiquetaTentativaId.id,
                },
              },
            },
          },
        },
      },
    });
  }
}
