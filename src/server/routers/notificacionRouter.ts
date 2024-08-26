import { protectedProcedure, router } from '@/server/trpc';
import { z } from 'zod';

export const notificacionRouter = router({
  addDevice: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const fcmToken = input;

      if (!ctx.session?.user?.esAdmin) {
        throw new Error('No tienes permisos para realizar esta acción');
      }

      await ctx.prisma.cuenta.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          fcmToken: {
            push: fcmToken,
          },
        },
      });

      return { success: true };
    }),
  removeDevice: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const fcmToken = input;

      if (!ctx.session?.user?.esAdmin) {
        throw new Error('No tienes permisos para realizar esta acción');
      }

      const previousTokens = await ctx.prisma.cuenta.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          fcmToken: true,
        },
      });

      if (!previousTokens) {
        throw new Error('No se encontró el dispositivo');
      }

      await ctx.prisma.cuenta.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          fcmToken: {
            set: previousTokens.fcmToken.filter((t) => t !== fcmToken),
          },
        },
      });

      return { success: true };
    }),
});
