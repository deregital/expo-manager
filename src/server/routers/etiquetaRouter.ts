import { protectedProcedure, publicProcedure, router } from '@/server/trpc';
import { z } from 'zod';

export const etiquetaRouter = router({
  create: publicProcedure
    .input(
      z.object({
        nombre: z.string().min(1, {
          message: 'El nombre debe tener al menos 1 caracter',
        }),
        grupoId: z.string().uuid({
          message: 'Debes seleccionar un grupo de etiquetas',
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.etiqueta.create({
        data: {
          nombre: input.nombre,
          grupo: {
            connect: {
              id: input.grupoId,
            },
          },
        },
      });
    }),
  delete: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.etiqueta.delete({
        where: {
          id: input,
        },
      });
    }),
  edit: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        nombre: z
          .string()
          .min(1, {
            message: 'El nombre debe tener al menos 1 caracter',
          })
          .optional(),
        grupoId: z
          .string()
          .uuid({
            message: 'Debes seleccionar un grupo de etiquetas',
          })
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
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
          },
        },
      });
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.etiqueta.findMany({
      where: {
        id: { in: ctx.etiquetasVisibles },
      },
      include: {
        grupo: true,
      },
    });
  }),
  getById: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.etiqueta.findUnique({
        where: {
          id: input,
          AND: {
            id: { in: ctx.etiquetasVisibles },
          },
        },
        include: {
          grupo: true,
        },
      });
    }),
  getByGrupoEtiqueta: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.etiqueta.findMany({
        where: {
          grupoId: input,
          id: { in: ctx.etiquetasVisibles },
        },
        include: {
          grupo: true,
        },
      });
    }),
  getByNombre: protectedProcedure.query(async ({ input, ctx }) => {
    const { data } = await ctx.fetch.GET('/tag/all-grouped');

    return data?.groups;
  }),
  setMasivo: protectedProcedure
    .input(
      z.object({
        etiquetaIds: z.array(z.string().uuid()),
        modeloIds: z.array(z.string().uuid()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await Promise.all(
        input.modeloIds.map(async (modeloId) => {
          await ctx.prisma.perfil.update({
            where: {
              id: modeloId,
            },
            data: {
              etiquetas: {
                connect: input.etiquetaIds.map((etiquetaId) => ({
                  id: etiquetaId,
                })),
              },
            },
          });
        })
      );
    }),
  unsetMasivo: protectedProcedure
    .input(
      z.object({
        etiquetaIds: z.array(z.string().uuid()),
        modeloIds: z.array(z.string().uuid()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await Promise.all(
        input.modeloIds.map(async (modeloId) => {
          await ctx.prisma.perfil.update({
            where: {
              id: modeloId,
            },
            data: {
              etiquetas: {
                disconnect: input.etiquetaIds.map((etiquetaId) => ({
                  id: etiquetaId,
                })),
              },
            },
          });
        })
      );
    }),
});
