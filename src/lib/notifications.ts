import { prisma } from '@/server/db';

export const getAdminNotificationTokens = async (): Promise<string[]> => {
  const res = await prisma.cuenta.findMany({
    where: {
      esAdmin: true,
    },
    select: {
      fcmToken: true,
    },
  });

  // console.log('Admin tokens:', res);
  const tokens = [];
  for (const r of res) {
    tokens.push(...r.fcmToken);
  }

  return tokens;
};
