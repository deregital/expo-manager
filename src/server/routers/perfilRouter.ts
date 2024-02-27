import { publicProcedure, router } from '@/server/trpc';
import { z } from 'zod';

export const perfilRouter = router({
  getById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => {
      //   if (!ctx.session || !ctx.session.user) {
      //     throw new TRPCError({ code: 'UNAUTHORIZED' });
      //   }

      return await ctx.prisma.perfil.findUnique({
        where: {
          id: input,
        },
        select: {
          nombreCompleto: true,
          etiquetas: true,
        },
      });
    }),
});
