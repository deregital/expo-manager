import { protectedProcedure, publicProcedure, router } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const modelosRouter = router({
    getAll: publicProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.perfil.findMany();
    }),
    getById: publicProcedure.input(z.string().uuid()).query(async ({ input, ctx }) => {
        return await ctx.prisma.perfil.findUnique({
            where: {
                id: input,
            },
        });
    }),
    getByEtiqueta: publicProcedure.input(z.string().array()).query(async ({ input, ctx }) => {
        return await ctx.prisma.perfil.findMany({
            where: {
                etiquetas: {
                    some: {
                        nombre: { in: input },
                    },
                },
            },
            select: {
                nombrePila: true,
                etiquetas: true,
            },
        });
    }),
    getByGrupoEtiqueta: publicProcedure.input(z.string().array()).query(async ({ input, ctx }) => {
        return await ctx.prisma.perfil.findMany({
            where: {
                etiquetas: {
                    some: {
                        grupo: {
                            nombre: { in: input },
                        },
                    },
                },
            },
            select: {
                id: true,
                nombrePila: true,
                etiquetas: {
                    select: {
                        grupo: true,
                    }
                },
            },
        });
    }),
});