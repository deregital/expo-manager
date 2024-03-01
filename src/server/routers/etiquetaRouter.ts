import { protectedProcedure, publicProcedure, router } from '@/server/trpc';
import { z } from 'zod';

export const etiquetaRouter = router({
  create: publicProcedure
    .input(
      z.object({
        nombre: z.string(),
        grupoId: z.string().uuid(),
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
        nombre: z.string().optional(),
        grupoId: z.string().uuid().optional(),
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
  getByNombre: protectedProcedure
    .input(z.string().optional())
    .query(async ({ input, ctx }) => {
      const gruposMatch = await ctx.prisma.etiquetaGrupo.findMany({
        where: {
          AND: {
            OR: [
              {
                nombre: {
                  contains: input,
                  mode: 'insensitive',
                },
              },
              {
                etiquetas: {
                  some: {
                    AND: {
                      nombre: {
                        contains: input,
                        mode: 'insensitive',
                      },
                      id: { in: ctx.etiquetasVisibles },
                    },
                  },
                },
              },
            ],
            etiquetas: {
              some: {
                id: { in: ctx.etiquetasVisibles },
              },
            },
          },
        },
        select: {
          etiquetas: {
            where: {
              id: { in: ctx.etiquetasVisibles },
            },
            include: {
              _count: true,
            },
            orderBy: {
              nombre: 'asc',
            },
          },
          _count: {
            select: {
              etiquetas: true,
            },
          },
          color: true,
          esExclusivo: true,
          nombre: true,
          id: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return gruposMatch;
    }),
});
