import { SendWhatsappResponse } from '@/server/types/webhooks';

async function enviarMensaje(
  phoneNumber: string,
  message: string
): Promise<SendWhatsappResponse> {
  const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_API_PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'text',
    text: {
      preview_url: false,
      body: message,
    },
  };
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
  };

  const res = await fetch(WHATSAPP_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const responseStatus = await res.status;
    const response = await res.text();
    throw new Error(responseStatus + response);
  }

  return await res.json();
}
