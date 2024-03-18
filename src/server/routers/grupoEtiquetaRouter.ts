import { protectedProcedure, router } from '@/server/trpc';
import { z } from 'zod';

export const grupoEtiquetaRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        nombre: z.string().min(1, {
          message: 'El nombre debe tener al menos 1 caracter',
        }),
        color: z
          .string()
          .length(7)
          .startsWith('#', {
            message: 'El color debe tener el formato #ABCDEF',
          })
          .toLowerCase(),
        esExclusivo: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.etiquetaGrupo.create({
        data: {
          nombre: input.nombre,
          color: input.color,
          esExclusivo: input.esExclusivo,
        },
      });
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.etiquetaGrupo.findMany({
      include: {
        etiquetas: true,
      },
    });
  }),
  getById: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.etiquetaGrupo.findUnique({
        where: {
          id: input,
        },
        include: {
          etiquetas: true,
        },
      });
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        nombre: z
          .string()
          .min(1, {
            message: 'El nombre debe tener al menos 1 caracter',
          })
          .optional(),
        color: z
          .string()
          .length(7)
          .startsWith('#', {
            message: 'El color debe tener el formato #ABCDEF',
          })
          .toLowerCase(),
        esExclusivo: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.etiquetaGrupo.update({
        where: {
          id: input.id,
        },
        data: {
          nombre: input.nombre,
          color: input.color,
          esExclusivo: input.esExclusivo,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.etiquetaGrupo.delete({
        where: {
          id: input,
        },
      });
    }),
});
