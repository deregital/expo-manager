import { verifyWebhook } from '@/lib/verify';
import { WebHookRequest } from '@/server/types/webhooks';
import { headers } from 'next/headers';
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

  if (webhookBody.entry.length > 0) {
    const changes = webhookBody.entry[0].changes;
    if (changes.length > 0) {
      if (changes[0].field === 'messages') {
        const changeValue = changes[0].value;
        const contacts = changeValue.contacts;
        const messages = changeValue.messages;
        console.log(JSON.stringify(changeValue, null, 2));
        // if (messages) {
        //   await prisma.mensaje.createMany({
        //     data: messages.map((msg) => {
        //         return {
        //             wamId: msg.id,
        //             from: msg.from,
        //             timestamp: new Date(Number.parseInt(msg.timestamp) * 1000),
        //             tipo: msg.type,
        //             perfilId: contacts[0].wa_id,
        //             imagen: msg.image ? {
        //                 create: {
        //                     id: msg.image.id,
        //                     sha256: msg.image.sha256,
        //                     mime_type: msg.image.mime_type,
        //                 }
        //             } : undefined
        //         }
        //     })
        // });
        // }
      }
    }
  }
}
