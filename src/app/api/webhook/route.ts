import { verifyWebhook } from '@/lib/verify';
import fs from 'fs';
import {
  type ReceivedMessage,
  type StatusChange,
  type WebHookRequest,
} from '@/server/types/webhooks';
import { headers } from 'next/headers';
import { prisma } from '@/server/db';
import { type NextRequest, NextResponse } from 'next/server';
import { MensajeStatus } from '@prisma/client';
import { join as pathJoin } from 'path';
import { enviarMensajeUnaSolaVez } from '@/server/routers/messageRouter';
import { getHighestIdLegible } from '@/lib/server';
import { getAdminNotificationTokens } from '@/lib/notifications';

export const revalidate = 0;
const FECHA_LIMITE_MENSAJE_AUTOMATICO = new Date(2024, 4, 10);

export async function GET(request: Request) {
  const urlDecoded = new URL(request.url);

  const urlParams = urlDecoded.searchParams;
  let mode = urlParams.get('hub.mode');
  let token = urlParams.get('hub.verify_token');
  let challenge = urlParams.get('hub.challenge');
  if (mode && token && challenge && mode == 'subscribe') {
    const isValid = token == process.env.META_WHATSAPP_WEBHOOK_VERIFY_TOKEN;
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
            const { mensajeCreado, perfil } = await crearMensaje(value);

            // TODO: Conseguir el token personal de cada usuario
            const tokens = await getAdminNotificationTokens();

            // 'cOTAFVF6iM6vRx8N-pL5pB:APA91bFBPG3TraWS8Oj9aI6tDVPAAcK4uk2UBmE0T5067N0Rat6zlZUpI2Las4E14slqtPC7P0KyeoYrO64lx_aF7M6AQ7bJbTScuJmAxKgp5Zl9P1B8-urrVNk712mQVO6Hf63Ni8UM';

            const ownURL = new URL(request.url);
            const urlFetch = ownURL.origin.includes('localhost')
              ? ownURL.origin
                  .replace('localhost', '127.0.0.1')
                  .replace('https', 'http')
              : ownURL.origin;

            if (value.messages[0].type === 'text') {
              await fetch(`${urlFetch}/api/send-notification`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  tokens,
                  title: 'Nuevo mensaje de ExpoManager',
                  message: `Nuevo mensaje de ${perfil?.nombreCompleto}: ${value.messages[0].text.body}`,
                  // TODO: Cambiar el link a la página de mensajes
                  link: `${urlFetch}/mensajes/${value.messages[0].from}`,
                }),
              });
            }

            if (
              (!perfil ||
                perfil?.created_at > FECHA_LIMITE_MENSAJE_AUTOMATICO) &&
              mensajeCreado &&
              mensajeCreado.perfil._count.mensajes === 1
            ) {
              await enviarRespuestaAutomatica(
                value.contacts[0].wa_id,
                mensajeCreado.perfil.nombrePila ??
                  mensajeCreado.perfil.nombreCompleto
              );
            }
            await updateJSONFile(
              value.contacts[0].wa_id,
              value.messages[0].timestamp
            );
          } else if ('statuses' in value) {
            await actualizarStatus(value);
            await updateJSONFile(
              value.metadata.display_phone_number,
              value.statuses[0].timestamp
            );
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

  const perfil = await prisma.perfil.findFirst({
    where: {
      telefono: contact.wa_id,
    },
    include: {
      etiquetas: true,
    },
  });

  if (!etiquetaTentativaId) {
    throw new Error('No se encontró la etiqueta TENTATIVA');
  }

  if (!message || !['text', 'button', 'template'].includes(message.type)) {
    return {
      perfil,
      mensajeCreado: null,
    };
  }

  const idLegibleMasAlto = await getHighestIdLegible(prisma);

  const doesMessageExist = await prisma.mensaje.findFirst({
    where: {
      wamId: message.id,
    },
  });

  if (doesMessageExist) {
    return {
      perfil,
      mensajeCreado: null,
    };
  }
  let mensaje: string | null = null;

  if (message.type === 'text') {
    mensaje = message.text.body;
  } else if (message.type === 'button') {
    mensaje = message.button.text;
  } else {
    mensaje = 'Mensaje no soportado';
  }

  const mensajeCreado = await prisma.mensaje.create({
    data: {
      wamId: message.id,
      statusAt: new Date(Number.parseInt(message.timestamp) * 1000),
      message: {
        ...message,
        type: 'text',
        text: {
          body: mensaje,
        },
      },
      perfil: {
        connectOrCreate: {
          where: {
            telefono: message.from,
          },
          create: {
            idLegible: idLegibleMasAlto + 1,
            nombreCompleto: contact.profile.name,
            nombrePila: contact.profile.name.split(' ')[0],
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
    include: {
      perfil: {
        select: {
          nombrePila: true,
          nombreCompleto: true,
          _count: {
            select: {
              mensajes: true,
            },
          },
        },
      },
    },
  });

  return { perfil, mensajeCreado };
}

async function actualizarStatus(value: StatusChange) {
  const status = value.statuses[0];
  if (!status || status.status === 'failed') return;

  const doesMessageExist = await prisma.mensaje.findFirst({
    where: {
      wamId: status.id,
    },
  });

  if (!doesMessageExist) {
    return;
  }

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

  const path =
    process.env.NODE_ENV === 'production'
      ? '/tmp/storeLastMessage.json'
      : pathJoin(process.cwd(), '/src/server/storeLastMessage.json');

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

async function enviarRespuestaAutomatica(
  telefono: string,
  nombreDePila: string
) {
  const mensaje = `¡Hola ${nombreDePila}! Muchas gracias por participar de Expo Desfiles. ¡Ya estás dentro! En los próximos días vas a recibir más información acerca de los próximos desfiles. Podés seguirnos en nuestro Instagram @expodesfiles para enterarte de todas las novedades. ¡Saludos!  `;

  const res = enviarMensajeUnaSolaVez(telefono, mensaje, prisma);

  return res;
}
