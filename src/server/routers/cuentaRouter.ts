import { protectedProcedure, router } from '@/server/trpc';
import { z } from 'zod';

export const cuentaRouter = router({
  updateFiltroBase: protectedProcedure
    .input(
      z.object({
        activo: z.boolean(),
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
          filtroBaseActivo: input.activo,
          filtroBase: {
            set: input.etiquetas ? input.etiquetas.map((id) => ({ id })) : [],
          },
        },
      });

      return true;
    }),
  getFiltroBase: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.fetch.GET('/account/global-filter');

    return data!;
  }),
  getMe: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.fetch.GET('/account/me');

    return data;
  }),
});
