import { protectedProcedure, publicProcedure, router } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const grupoEtiquetaRouter = router({
    create: protectedProcedure.input(z.object({
        nombre: z.string(),
        color: z.string().length(7).startsWith('#').toLowerCase(),
        esExclusivo: z.boolean(),
    })).mutation(async ({ input, ctx }) => {
        return await ctx.prisma.etiquetaGrupo.create({
            data: {
                nombre: input.nombre,
                color: input.color,
                esExclusivo: input.esExclusivo,
            }
        });
    }),
})