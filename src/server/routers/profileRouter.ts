import {
  handleError,
  protectedProcedure,
  publicProcedure,
  router,
} from '@/server/trpc';
import { Prisma, TipoEtiqueta } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  createProfileSchema,
  profileSchema,
  tagGroupSchema,
  tagSchema,
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
  edit: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        idLegible: z.number().optional(),
        nombreCompleto: z.string().optional(),
        nombrePila: z.string().optional(),
        telefono: z
          .string()
          .regex(
            /^549(11|[2368]\d)\d{8}$/,
            'El teléfono no es válido, debe empezar con 549 y tener 10 dígitos. Ejemplo: 5491123456789'
          )
          .optional(),
        telefonoSecundario: z
          .string()
          .regex(
            /^549(11|[2368]\d)\d{8}$/,
            'El teléfono no es válido, debe empezar con 549 y tener 10 dígitos. Ejemplo: 5491123456789'
          )
          .optional()
          .nullable(),
        fotoUrl: z.string().optional().nullable(),
        genero: z.string().optional(),
        fechaNacimiento: z.string().optional(),
        instagram: z
          .string()
          .regex(
            /^[\w](?!.*?\.{2})[\w.]{1,28}[\w]$/,
            'El instagram no es válido. No debe comenzar con @'
          )
          .optional()
          .nullable(),
        mail: z
          .string()
          .email('El mail no es válido, debe tener el formato mail@mail.com')
          .optional()
          .nullable(),
        dni: z.string().optional().nullable(),
        nombresAlternativos: z.array(z.string()).optional().nullable(),
        etiquetas: z
          .array(
            z.object({
              id: z.string().uuid(),
              grupo: z.object({
                id: z.string().uuid(),
                esExclusivo: z.boolean(),
              }),
              nombre: z.string(),
            })
          )
          .optional(),
        esPapelera: z.boolean().optional(),
        fechaPapelera: z.string().datetime().nullable().optional(),
        paisNacimiento: z.string().optional(),
        provinciaNacimiento: z.string().optional(),
        provinciaResidencia: z.string().optional(),
        localidadResidencia: z.string().optional(),
        residenciaLatitud: z.number().optional(),
        residenciaLongitud: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      input.etiquetas?.forEach((etiqueta) => {
        if (etiqueta.grupo.esExclusivo) {
          const exclusividad = input.etiquetas?.filter(
            (e) => e.grupo.id === etiqueta.grupo.id && e.id !== etiqueta.id
          );
          if (exclusividad && exclusividad.length > 0) {
            throw new TRPCError({
              code: 'PARSE_ERROR',
              message: `Las etiquetas ${etiqueta.nombre} y ${exclusividad[0].nombre} son exclusivas del mismo grupo`,
            });
          }
        }
      });

      const perfilConMismoTelefono = await ctx.prisma.perfil
        .findMany({
          where: {
            OR: [
              {
                telefono: input.telefono,
              },
              {
                telefono: input.telefonoSecundario ?? undefined,
              },
              {
                dni: input.dni ?? undefined,
              },
              {
                telefonoSecundario: input.telefonoSecundario ?? undefined,
              },
              {
                telefonoSecundario: input.telefono ?? undefined,
              },
            ],
          },
        })
        .then((res) => {
          return res.filter((p) => p.id !== input.id);
        });

      if (perfilConMismoTelefono && perfilConMismoTelefono.length > 0) {
        if (
          perfilConMismoTelefono.some(
            (p) =>
              p.telefono === input.telefono ||
              p.telefonoSecundario === input.telefono
          )
        ) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Ya existe un perfil con el teléfono ${input.telefono}`,
          });
        } else if (
          perfilConMismoTelefono.some((p) => p.dni === input.dni) &&
          input.dni
        ) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Ya existe un perfil con el DNI ${input.dni}`,
          });
        } else if (
          perfilConMismoTelefono.some(
            (p) =>
              p.telefonoSecundario === input.telefonoSecundario ||
              p.telefono === input.telefonoSecundario
          ) &&
          input.telefonoSecundario
        ) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Ya existe un perfil con el teléfono secundario ${input.telefonoSecundario}`,
          });
        }
      }

      const nombrePila = input.nombreCompleto
        ? input.nombreCompleto.split(' ')[0]
        : input.nombrePila;

      const etiquetaModelo = await ctx.prisma.etiqueta.findFirst({
        where: {
          tipo: TipoEtiqueta.MODELO,
        },
      });

      if (!etiquetaModelo) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No se encontró la etiqueta de modelo',
        });
      }

      const connectResidencia =
        input.residenciaLatitud !== undefined &&
        input.residenciaLongitud !== undefined;

      return await ctx.prisma.perfil.update({
        where: {
          id: input.id,
        },
        data: {
          nombreCompleto: input.nombreCompleto,
          idLegible: input.idLegible,
          nombrePila: nombrePila,
          telefono: input.telefono,
          telefonoSecundario: input.telefonoSecundario,
          genero: input.genero,
          fotoUrl: input.fotoUrl,
          fechaNacimiento: input.fechaNacimiento
            ? new Date(input.fechaNacimiento)
            : undefined,
          instagram: input.instagram,
          mail: input.mail,
          dni: input.dni,
          nombresAlternativos: input.nombresAlternativos ?? undefined,
          etiquetas: input.etiquetas
            ? {
                set: [etiquetaModelo, ...(input.etiquetas ?? [])].map(
                  (etiqueta) => {
                    return {
                      id: etiqueta.id,
                    };
                  }
                ),
              }
            : undefined,
          esPapelera: input.esPapelera ?? undefined,
          fechaPapelera:
            input.fechaPapelera === null
              ? null
              : input.fechaPapelera
                ? new Date(input.fechaPapelera)
                : undefined,
          paisNacimiento: input.paisNacimiento ?? null,
          provinciaNacimiento: input.provinciaNacimiento ?? null,
          residencia: {
            connectOrCreate: connectResidencia
              ? {
                  where: {
                    latitud_longitud: {
                      latitud: input.residenciaLatitud ?? 0,
                      longitud: input.residenciaLongitud ?? 0,
                    },
                  },
                  create: {
                    latitud: input.residenciaLatitud ?? 0,
                    longitud: input.residenciaLongitud ?? 0,
                    localidad: input.localidadResidencia ?? '',
                    provincia: input.provinciaResidencia ?? '',
                  },
                }
              : undefined,
          },
        },
      });
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
