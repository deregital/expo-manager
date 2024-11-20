import admin from 'firebase-admin';
import { type MulticastMessage } from 'firebase-admin/messaging';
import { type NextRequest, NextResponse } from 'next/server';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_KEY)
    : {};

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function POST(request: NextRequest) {
  const { tokens, title, message, link } = (await request.json()) as {
    tokens: string[];
    title: string;
    message: string;
    link?: string;
  };

  const payload: MulticastMessage = {
    tokens,
    notification: {
      title: title,
      body: message,
    },
    webpush: link
      ? {
          fcmOptions: {
            link,
          },
        }
      : undefined,
  };

  try {
    await admin.messaging().sendEachForMulticast(payload);

    return NextResponse.json({ success: true, message: 'Notification sent!' });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}
