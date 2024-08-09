import { getHighestIdLegible } from '@/lib/server';
import { normalize } from '@/lib/utils';
import { modeloSchemaCrearOEditar } from '@/server/schemas/modelo';
import { protectedProcedure, publicProcedure, router } from '@/server/trpc';
import { MessageJson } from '@/server/types/whatsapp';
import { Mensaje, Perfil, Prisma, TipoEtiqueta } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { subDays } from 'date-fns';
import levenshtein from 'string-comparison';
import { z } from 'zod';
import { ModelosSimilarity } from '../types/modelos';

export const modeloRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const modelos = await ctx.prisma.perfil.findMany({
      where: {
        etiquetas: {
          some: {
            id: { in: ctx.etiquetasVisibles },
          },
        },
      },
      include: {
        etiquetas: {
          include: {
            grupo: {
              select: {
                color: true,
                esExclusivo: true,
              },
            },
          },
        },
      },
    });

    return modelos;
  }),
  getAllWithInChat: protectedProcedure.query(async ({ ctx }) => {
    const modelos = await ctx.prisma
      .$extends({
        result: {
          perfil: {
            inChat: {
              compute(data: Perfil & { mensajes: Mensaje[] }) {
                return (
                  data.mensajes.length > 0 &&
                  data.mensajes.some(
                    (m) =>
                      m.created_at > subDays(new Date(), 1) &&
                      (m.message as MessageJson).from === data.telefono
                  )
                );
              },
            },
          },
        },
      })
      .perfil.findMany({
        where: {
          etiquetas: {
            some: {
              id: { in: ctx.etiquetasVisibles },
            },
          },
        },
        include: {
          mensajes: true,
        },
      });
    return modelos;
  }),
  getById: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => {
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
          etiquetas: {
            include: {
              grupo: {
                select: {
                  id: true,
                  color: true,
                  esExclusivo: true,
                },
              },
            },
          },
        },
      });
    }),
  getByEtiqueta: protectedProcedure
    .input(z.string().array())
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.perfil.findMany({
        where: {
          AND: [
            {
              etiquetas: {
                some: {
                  id: { in: input },
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
        include: {
          etiquetas: {
            include: {
              grupo: {
                select: {
                  esExclusivo: true,
                },
              },
            },
          },
        },
      });
    }),
  getByGrupoEtiqueta: protectedProcedure
    .input(z.string().array())
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.perfil.findMany({
        where: {
          etiquetas: {
            some: {
              id: { in: ctx.etiquetasVisibles },
              grupo: {
                id: {
                  in: input,
                },
              },
            },
          },
        },
        include: {
          etiquetas: true,
        },
      });
    }),
  create: publicProcedure
    .input(
      modeloSchemaCrearOEditar.pick({
        nombreCompleto: true,
        telefono: true,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const idLegibleMasAlto = await getHighestIdLegible(ctx.prisma);
      return await ctx.prisma.perfil.create({
        data: {
          ...input,
          idLegible: idLegibleMasAlto + 1,
        },
      });
    }),
  createManual: publicProcedure
    .input(
      z.object({
        modelo: modeloSchemaCrearOEditar,
        similarity: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const modeloEtiqueta = await ctx.prisma.etiqueta.findFirst({
        where: {
          tipo: TipoEtiqueta.MODELO,
        },
      });

      if (!modeloEtiqueta) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No se encontró la etiqueta de modelo',
        });
      }

      const telefono = input.modelo.telefono.startsWith('549')
        ? input.modelo.telefono
        : `549${input.modelo.telefono}`;

      const perfilConMismoTelefonoDNI = await ctx.prisma.perfil.findMany({
        where: {
          OR: [
            {
              telefono: telefono,
            },
            {
              dni: input.modelo.dni ?? undefined,
            },
          ],
        },
      });
      if (perfilConMismoTelefonoDNI && perfilConMismoTelefonoDNI.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Ya existe un perfil con el mismo teléfono o DNI`,
        });
      }
      const modelos = await ctx.prisma.perfil.findMany({
        select: {
          id: true,
          nombreCompleto: true,
          telefono: true,
        },
      });
      const similarityModelos: ModelosSimilarity = [];
      if (!input.similarity) {
        modelos.forEach(async (modelo) => {
          if (modelo.telefono === input.modelo.telefono) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Ya existe un registro con ese teléfono',
            });
          }
          const similarityTelefono = levenshtein.levenshtein.similarity(
            modelo.telefono,
            input.modelo.telefono
          );
          const similarityNombre = levenshtein.levenshtein.similarity(
            normalize(modelo.nombreCompleto).toLowerCase(),
            normalize(input.modelo.nombreCompleto).toLocaleLowerCase()
          );
          if (similarityTelefono >= 0.75 || similarityNombre >= 0.75) {
            similarityModelos.push({
              similarityTelefono: similarityTelefono,
              similarityNombre: similarityNombre,
              modelo: {
                ...modelo,
              },
            });
          }
        });
        if (similarityModelos.length > 0) {
          return similarityModelos;
        }
      }

      const idLegibleMasAlto = await getHighestIdLegible(ctx.prisma);

      return await ctx.prisma.perfil.create({
        data: {
          idLegible: idLegibleMasAlto + 1,
          nombreCompleto: input.modelo.nombreCompleto,
          nombrePila: input.modelo.nombreCompleto.split(' ')[0],
          telefono: telefono,
          genero:
            input.modelo.genero !== 'N/A' ? input.modelo.genero : undefined,
          fechaNacimiento: input.modelo.fechaNacimiento
            ? new Date(input.modelo.fechaNacimiento)
            : undefined,
          fotoUrl: input.modelo.fotoUrl ? input.modelo.fotoUrl : undefined,
          etiquetas: {
            connect: [modeloEtiqueta.id, ...(input.modelo.etiquetas ?? [])].map(
              (etiqueta) => {
                return {
                  id: etiqueta,
                };
              }
            ),
          },
          nombresAlternativos: input.modelo.apodos
            ? input.modelo.apodos
            : undefined,
          dni: input.modelo.dni ? input.modelo.dni : undefined,
          mail: input.modelo.mail ? input.modelo.mail : undefined,
          instagram: input.modelo.instagram
            ? input.modelo.instagram
            : undefined,
        },
        select: {
          id: true,
        },
      });
    }),
  delete: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.perfil.delete({
        where: {
          id: input,
        },
      });
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
            /^\+?549(11|[2368]\d)\d{8}$/,
            'El teléfono no es válido, debe empezar con 549 y tener 10 dígitos. Ejemplo: 5491123456789'
          )
          .optional(),
        fotoUrl: z.string().optional().nullable(),
        genero: z.string().optional(),
        fechaNacimiento: z.string().optional(),
        instagram: z.string().optional().nullable(),
        mail: z.string().optional().nullable(),
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

      const perfilConMismoTelefono = await ctx.prisma.perfil.findMany({
        where: {
          OR: [
            {
              telefono: input.telefono,
            },
            {
              dni: input.dni ?? undefined,
            },
          ],
        },
      });

      if (
        perfilConMismoTelefono &&
        perfilConMismoTelefono.length > 0 &&
        perfilConMismoTelefono.find((p) => p.id !== input.id)
      ) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Ya existe un perfil con el teléfono ${input.telefono}`,
        });
      }

      const nombrePila = input.nombreCompleto
        ? input.nombreCompleto.split(' ')[0]
        : input.nombrePila;

      return await ctx.prisma.perfil.update({
        where: {
          id: input.id,
        },
        data: {
          nombreCompleto: input.nombreCompleto,
          idLegible: input.idLegible,
          nombrePila: nombrePila,
          telefono: input.telefono,
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
                set: (input.etiquetas ?? []).map((etiqueta) => {
                  return {
                    id: etiqueta.id,
                  };
                }),
              }
            : undefined,
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
          telefono: input,
          etiquetas: {
            some: {
              id: { in: ctx.etiquetasVisibles },
            },
          },
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
