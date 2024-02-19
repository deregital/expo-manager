import { protectedProcedure, publicProcedure, router } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const etiquetaRouter = router({
    create: publicProcedure.input(z.object({
        nombre: z.string(),
        grupoId: z.string().uuid(),
    })).mutation(async ({ input, ctx }) => {
        return await ctx.prisma.etiqueta.create({
            data: {
                nombre: input.nombre,
                grupoId: input.grupoId,
            },
        });
    }),
    delete: publicProcedure.input(z.string().uuid()).mutation(async ({ input, ctx }) => {
        return await ctx.prisma.etiqueta.delete({
            where: {
                id: input,
            },
        });
    }),
});