import crypto from 'crypto';

export function verifyWebhook(message: string, signature: string): boolean {
  const prefix = 'sha256=';
  if (!signature.startsWith(prefix)) {
    return false;
  }
  const sigWithoutPrefix = signature.slice(prefix.length);

  if (!process.env.META_APP_SECRET) {
    throw new Error('FACEBOOK_APP_SECRET is not set');
  }

  const hmac = crypto.createHmac('sha256', process.env.META_APP_SECRET);
  const messageHash = hmac.update(message).digest('hex');
  return sigWithoutPrefix === messageHash;
}
