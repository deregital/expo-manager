import { handleError, protectedProcedure, router } from '@/server/trpc';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import {
  createProfileSchema,
  profileSchema,
  tagGroupSchema,
  tagSchema,
  updateProfileSchema,
} from 'expo-backend-types';

export const modeloRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.fetch.GET('/profile/all');

    return data?.profiles ?? [];
  }),
  getAllWithActiveChat: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.fetch.GET('/profile/all-with-active-chat');

    return data?.profiles ?? [];
  }),
  getById: protectedProcedure
    .input(profileSchema.shape.id)
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.GET(`/profile/{id}`, {
        params: {
          path: {
            id: input,
          },
        },
      });

      if (error) handleError(error);

      return data;
    }),
  getByTags: protectedProcedure
    .input(z.array(tagSchema.shape.id))
    .query(async ({ input, ctx }) => {
      const { error, data } = await ctx.fetch.GET('/profile/find-by-tags', {
        params: {
          query: {
            tags: input,
          },
        },
      });

      if (error) handleError(error);

      return data?.profiles ?? [];
    }),
  getByTagGroups: protectedProcedure
    .input(z.array(tagGroupSchema.shape.id))
    .query(async ({ input, ctx }) => {
      const { error, data } = await ctx.fetch.GET(
        '/profile/find-by-tag-groups',
        {
          params: {
            query: {
              tagGroups: input,
            },
          },
        }
      );

      if (error) handleError(error);

      return data?.profiles ?? [];
    }),
  create: protectedProcedure
    .input(createProfileSchema)
    .mutation(async ({ input, ctx }) => {
      const birthDate = input.profile.birthDate?.toISOString() ?? null;

      const { data, error } = await ctx.fetch.POST('/profile/create', {
        body: {
          checkForSimilarity: input.checkForSimilarity,
          profile: {
            ...input.profile,
            birthDate,
          },
        },
      });

      if (error) handleError(error);

      return data!.response;
    }),
  delete: protectedProcedure
    .input(profileSchema.shape.id)
    .mutation(async ({ input, ctx }) => {
      const { error, data } = await ctx.fetch.DELETE(`/profile/{id}`, {
        params: {
          path: {
            id: input,
          },
        },
      });

      if (error) handleError(error);

      return data;
    }),
  edit: protectedProcedure
    .input(
      updateProfileSchema.extend({
        id: profileSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const birthDate = input.birthDate?.toISOString() ?? null;
      const movedToTrashDate = input.movedToTrashDate?.toISOString() ?? null;
      const { error, data } = await ctx.fetch.PATCH(`/profile/{id}`, {
        params: {
          path: {
            id: input.id,
          },
        },
        body: {
          ...input,
          movedToTrashDate: movedToTrashDate,
          birthDate: birthDate,
        },
      });

      if (error) handleError(error);

      return data;
    }),
  getByFiltro: protectedProcedure
    .input(
      z.object({
        nombre: z.string().optional(),
        grupoId: z.string().uuid().optional(),
        etiquetaId: z.string().uuid().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.perfil.findMany({
        where: {
          esPapelera: false,
          AND: [
            {
              nombreCompleto: {
                contains: input.nombre,
                mode: 'insensitive',
              },
            },
            {
              etiquetas: {
                some: {
                  id: input.etiquetaId,
                },
              },
            },
            {
              etiquetas: {
                some: {
                  id: { in: ctx.etiquetasVisibles },
                  grupo: {
                    id: input.grupoId,
                  },
                },
              },
            },
          ],
        },
        include: {
          etiquetas: {
            include: {
              grupo: {
                select: {
                  color: true,
                },
              },
            },
          },
        },
      });
    }),
  getByDateRange: protectedProcedure
    .input(
      z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        etiquetaId: z.string().optional(),
      })
    )
    .output(z.custom<ReturnType<typeof modelosAgrupadas>>())
    .query(async ({ input, ctx }) => {
      const startDateTime = input.start ? new Date(input.start) : undefined;
      const endDateTime = input.end ? new Date(input.end) : undefined;

      const modelos = await ctx.prisma.perfil.findMany({
        where: {
          esPapelera: false,
          created_at: {
            gte: startDateTime,
            lte: endDateTime,
          },
          AND: [
            {
              etiquetas: {
                some: {
                  id: input.etiquetaId,
                },
              },
            },
            {
              etiquetas: {
                some: {
                  id: { in: ctx.etiquetasVisibles },
                },
              },
            },
          ],
        },
        orderBy: {
          created_at: 'asc',
        },
        include: {
          mensajes: true,
          etiquetas: {
            include: {
              grupo: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      const groupedModelos = modelosAgrupadas(modelos);

      return groupedModelos;
    }),
  getByTelefono: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.perfil.findUnique({
        where: {
          esPapelera: false,
          telefono: input,
          etiquetas: {
            some: {
              id: { in: ctx.etiquetasVisibles },
            },
          },
        },
      });
    }),
  getModelosPapelera: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.perfil.findMany({
      where: {
        esPapelera: true,
        etiquetas: {
          some: {
            id: { in: ctx.etiquetasVisibles },
          },
        },
      },
      select: {
        id: true,
        nombreCompleto: true,
        fotoUrl: true,
        created_at: true,
        esPapelera: true,
        telefono: true,
        fechaPapelera: true,
      },
    });
  }),
});

function modelosAgrupadas(
  modelos: Prisma.PerfilGetPayload<{
    include: {
      mensajes: true;
      etiquetas: {
        include: {
          grupo: {
            select: {
              id: true;
            };
          };
        };
      };
    };
  }>[]
) {
  return modelos.reduce(
    (acc, modelo) => {
      const date = modelo.created_at.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(modelo);
      return acc;
    },
    {} as Record<string, typeof modelos>
  );
}
