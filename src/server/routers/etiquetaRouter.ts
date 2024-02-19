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
    edit: publicProcedure.input(z.object({
        id: z.string().uuid(),
        nombre: z.string().optional(),
        grupoId: z.string().uuid().optional(),
    })).mutation(async ({ input, ctx }) => {
        return await ctx.prisma.etiqueta.update({
            where: {
                id: input.id,
            },
            data: {
                nombre: input.nombre,
                grupo: {
                    connect: {
                        id: input.grupoId,
                    },
                }
            },
        });
    }),
});