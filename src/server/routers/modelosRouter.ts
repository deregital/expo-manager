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
    createModelo: publicProcedure.input(z.object({
        nombreCompleto: z.string(),
        telefono: z.string(),
    })).mutation(async ({ input, ctx }) => {
        return await ctx.prisma.perfil.create({
            data: input,
        });
    }),
    deleteModelo: publicProcedure.input(z.string().uuid()).mutation(async ({ input, ctx }) => {
        return await ctx.prisma.perfil.delete({
            where: {
                id: input,
            },
        });
    }),
    editModelo: publicProcedure.input(z.object({
        id: z.string().uuid(),
        idLegible: z.string().optional(),
        nombreCompleto: z.string().optional(),
        nombrePila: z.string().optional(),
        telefono: z.string().optional(),
        genero: z.string().optional(),
        edad: z.number().optional(),
        etiquetas: z.array(z.object({
            id: z.string().uuid(),
            nombre: z.string(),
            grupoId: z.string().uuid(),
        })).optional(),
    })).mutation(async ({ input, ctx }) => {
        return await ctx.prisma.perfil.update({
            where: {
                id: input.id,
            },
            data: {
                nombreCompleto: input.nombreCompleto,
                idLegible: input.idLegible,
                nombrePila: input.nombrePila,
                telefono: input.telefono,
                genero: input.genero,
                edad: input.edad,
                etiquetas: {
                    connect: (input.etiquetas ?? []).map((etiqueta) => {
                        return {
                            id: etiqueta.id,
                        }
                    }),
                },
            }
        });
    }),
});