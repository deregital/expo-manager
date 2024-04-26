import { verifyWebhook } from '@/lib/verify';
import fs from 'fs';
import {
  ReceivedMessage,
  StatusChange,
  WebHookRequest,
} from '@/server/types/webhooks';
import { headers } from 'next/headers';
import { prisma } from '@/server/db';
import { NextRequest, NextResponse } from 'next/server';
import { MensajeStatus } from '@prisma/client';

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
            await crearMensaje(value).then(() => {
              updateJSONFile(
                value.contacts[0].wa_id,
                value.messages[0].timestamp
              );
            });
          } else if ('statuses' in value) {
            await actualizarStatus(value).then(() => {
              updateJSONFile(
                value.metadata.display_phone_number,
                value.statuses[0].timestamp
              );
            });
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
        statusAt: new Date(Number.parseInt(message.timestamp) * 1000),
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

async function actualizarStatus(value: StatusChange) {
  const status = value.statuses[0];
  return await prisma.mensaje.update({
    where: {
      wamId: status.id,
    },
    data: {
      statusAt: new Date(Number.parseInt(status.timestamp) * 1000),
      status:
        status.status === 'delivered'
          ? MensajeStatus.RECIBIDO
          : status.status === 'read'
            ? MensajeStatus.LEIDO
            : MensajeStatus.ENVIADO,
    },
  });
}

async function updateJSONFile(waId: string, timestamp: string) {
  const data = {
    waId: waId,
    timestamp: timestamp,
  };

  const path = process.cwd() + '/storeLastMessage.json';

  const doesFileExist = fs.existsSync(path);

  if (!doesFileExist) {
    fs.writeFileSync(path, '[]', 'utf8');
  }

  const jsonData = JSON.parse(fs.readFileSync(path, 'utf-8'));

  const myEntry = jsonData.find(
    (entry: { waId: string }) => entry.waId === waId
  );

  if (myEntry) {
    const index = jsonData.indexOf(myEntry);
    jsonData[index] = data;
  } else {
    jsonData.push(data);
  }

  fs.writeFileSync(path, JSON.stringify(jsonData), 'utf-8');
}
