import { protectedProcedure, router } from '@/server/trpc';
import { z } from 'zod';

export const carpetaEventosRouter = router({
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.carpetaEventos.create({
        data: {
          nombre: input.nombre,
          color: input.color,
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.carpetaEventos.findMany({
      include: {
        eventos: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });
  }),

  getById: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.carpetaEventos.findUnique({
        where: {
          id: input,
        },
        include: {
          eventos: true,
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
          .toLowerCase()
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.carpetaEventos.update({
        where: {
          id: input.id,
        },
        data: {
          nombre: input.nombre,
          color: input.color,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.carpetaEventos.delete({
        where: {
          id: input,
        },
      });
    }),
});
