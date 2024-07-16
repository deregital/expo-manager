import { protectedProcedure, router } from '@/server/trpc';
import { z } from 'zod';

export const cuentaRouter = router({
  updateFiltroBase: protectedProcedure
    .input(
      z.object({
        etiquetas: z.array(z.string().uuid()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error('No se ha encontrado el usuario');
      }

      await ctx.prisma.cuenta.update({
        where: {
          id: userId,
        },
        data: {
          filtroBase: {
            set: input.etiquetas ? input.etiquetas.map((id) => ({ id })) : [],
          },
        },
      });

      return true;
    }),
});
