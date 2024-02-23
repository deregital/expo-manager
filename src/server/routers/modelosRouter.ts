import { protectedProcedure, publicProcedure, router } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import next from 'next';
import { z } from 'zod';

export const modeloRouter = router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.perfil.findMany({
            where: {
                etiquetas: {
                    some: {
                        id: { in: ctx.etiquetasVisibles },
                    },
                },
            },
            include: {
                etiquetas: true,
            },
        });
    }),
    getById: protectedProcedure.input(z.string().uuid()).query(async ({ input, ctx }) => {
        return await ctx.prisma.perfil.findUnique({
            where: {
                id: input, 
                etiquetas: {
                    some: {
                        id: { in: ctx.etiquetasVisibles },
                    },
                },
            },
            include: {
                etiquetas: true,
            },
        });
    }),
    getByEtiqueta: protectedProcedure.input(z.string().array()).query(async ({ input, ctx }) => {
        return await ctx.prisma.perfil.findMany({
            where: {
                etiquetas: {
                    some: {
                        id: { in: ctx.etiquetasVisibles },
                        nombre: { in: input },
                    },
                },
            },
            include: {
                etiquetas: true,
            },
        });
    }),
    getByGrupoEtiqueta: protectedProcedure.input(z.string().array()).query(async ({ input, ctx }) => {
        return await ctx.prisma.perfil.findMany({
            where: {
                etiquetas: {
                    some: {
                        id: { in: ctx.etiquetasVisibles },
                        grupo: {
                            nombre: { in: input },
                        },
                    },
                },
            },
            include: {
                etiquetas: true,
            },
        });
    }),
    create: publicProcedure.input(z.object({
        nombreCompleto: z.string(),
        telefono: z.string(),
    })).mutation(async ({ input, ctx }) => {
        return await ctx.prisma.perfil.create({
            data: input,
        });
    }),
    delete: publicProcedure.input(z.string().uuid()).mutation(async ({ input, ctx }) => {
        return await ctx.prisma.perfil.delete({
            where: {
                id: input,
            },
        });
    }),
    edit: publicProcedure.input(z.object({
        id: z.string().uuid(),
        idLegible: z.string().optional(),
        nombreCompleto: z.string().optional(),
        nombrePila: z.string().optional(),
        telefono: z.string().optional(),
        genero: z.string().optional(),
        edad: z.number().optional(),
        etiquetas: z.array(z.string()).optional(),
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
                    set: (input.etiquetas ?? []).map((etiqueta) => {
                        return {
                            id: etiqueta,
                        }
                    }),
                },
            },
        });
    }),
});