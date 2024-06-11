import { protectedProcedure, publicProcedure, router } from '@/server/trpc';
import { MessageJson } from '@/server/types/whatsapp';
import { Mensaje, Perfil } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { subDays } from 'date-fns';
import { z } from 'zod';

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
      z.object({
        nombreCompleto: z.string(),
        telefono: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.perfil.create({
        data: input,
      });
    }),
  createManual: publicProcedure
    .input(
      z.object({
        nombreCompleto: z.string(),
        telefono: z.string(),
        genero: z.string().optional(),
        fechaNacimiento: z.string().optional(),
        fotoUrl: z.string().optional().nullable(),
        etiquetas: z.array(z.string().uuid()).optional(),
        apodos: z.array(z.string()).optional(),
        dni: z.string().optional(),
        mail: z.string().includes('@').optional(),
        instagram: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.perfil.create({
        data: {
          nombreCompleto: input.nombreCompleto,
          nombrePila: input.nombreCompleto.split(' ')[0],
          telefono: input.telefono,
          genero: input.genero !== 'N/A' ? input.genero : undefined,
          fechaNacimiento: input.fechaNacimiento
            ? new Date(input.fechaNacimiento)
            : undefined,
          fotoUrl: input.fotoUrl ? input.fotoUrl : undefined,
          etiquetas: input.etiquetas
            ? {
                connect: input.etiquetas.map((etiqueta) => {
                  return {
                    id: etiqueta,
                  };
                }),
              }
            : undefined,
          nombresAlternativos: input.apodos ? input.apodos : undefined,
          dni: input.dni ? input.dni : undefined,
          mail: input.mail ? input.mail : undefined,
          instagram: input.instagram ? input.instagram : undefined,
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
        telefono: z.string().optional(),
        fotoUrl: z.string().optional().nullable(),
        genero: z.string().optional(),
        fechaNacimiento: z.string().optional(),
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
              code: 'CONFLICT',
              message: `Las etiquetas ${etiqueta.nombre} y ${exclusividad[0].nombre} son exclusivas del mismo grupo`,
            });
          }
        }
      });
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
          fotoUrl: input.fotoUrl,
          fechaNacimiento: input.fechaNacimiento
            ? new Date(input.fechaNacimiento)
            : undefined,
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

      const groupedModelos = modelos.reduce(
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
