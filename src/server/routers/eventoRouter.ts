import { protectedProcedure, router } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const eventoRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        nombre: z.string().min(1, 'El nombre es requerido'),
        fecha: z
          .string()
          .min(1, 'La fecha es requerida')
          .transform((val) => new Date(val)),
        ubicacion: z.string().min(1, 'La ubicación es requerida'),
        subeventos: z.array(
          z.object({
            fecha: z
              .string()
              .min(1, 'La fecha es requerida')
              .transform((val) => new Date(val)),
            ubicacion: z.string().min(1, 'La ubicación es requerida'),
            nombre: z.string().min(1, 'El nombre es requerido'),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.evento.create({
        data: {
          nombre: input.nombre,
          fecha: input.fecha,
          ubicacion: input.ubicacion,
          subEventos: {
            createMany: { data: input.subeventos },
          },
        },
      });
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.evento.findMany({
      include: {
        subEventos: true,
        eventoPadre: true,
      },
    });
  }),
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const evento = await ctx.prisma.evento.findUnique({
        where: {
          id: input.id,
        },
        include: {
          subEventos: true,
          eventoPadre: true,
        },
      });

      if (!evento) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Evento no encontrado',
        });
      }

      return evento;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        nombre: z.string().min(1).optional(),
        fecha: z
          .string()
          .transform((val) => new Date(val))
          .optional(),
        ubicacion: z.string().optional(),
        subeventos: z.array(
          z.object({
            id: z.string(), // Agrega el ID del subevento
            fecha: z
              .string()
              .min(1, 'La fecha es requerida')
              .transform((val) => new Date(val)),
            ubicacion: z.string().min(1, 'La ubicación es requerida'),
            nombre: z.string().min(1, 'El nombre es requerido'),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.evento.update({
        where: {
          id: input.id,
        },
        data: {
          nombre: input.nombre,
          fecha: input.fecha,
          ubicacion: input.ubicacion,
        },
      });

      const subeventos = await ctx.prisma.evento.findMany({
        where: {
          eventoPadreId: input.id,
        },
      });

      const subEventosEliminados = subeventos.filter(
        (subevento) => !input.subeventos.some((sub) => sub.id === subevento.id)
      );

      const subEventosActualizadosOAgregados = input.subeventos.filter(
        (subevento) => !subeventos.some((sub) => sub.id === subevento.id)
      );

      await Promise.all(
        subEventosActualizadosOAgregados.map(async (subevento) => {
          await ctx.prisma.evento.upsert({
            where: {
              id: subevento.id,
            },
            update: {
              fecha: subevento.fecha,
              ubicacion: subevento.ubicacion,
              nombre: subevento.nombre,
            },
            create: {
              fecha: subevento.fecha,
              ubicacion: subevento.ubicacion,
              nombre: subevento.nombre,
              eventoPadre: {
                connect: {
                  id: input.id,
                },
              },
            },
          });
        })
      );

      // Eliminar los subeventos que no se encuentren en la lista de subeventos
      await Promise.all(
        subEventosEliminados.map(async (subevento) => {
          await ctx.prisma.evento.delete({
            where: {
              id: subevento.id,
            },
          });
        })
      );

      return 'OK';
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.evento.delete({
        where: {
          id: input.id,
        },
      });
    }),

  getSubeventos: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const evento = await ctx.prisma.evento.findUnique({
        where: {
          id: input.id,
        },
        include: {
          subEventos: true,
        },
      });

      if (!evento) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Evento no encontrado',
        });
      }

      return evento.subEventos;
    }),

  addSubevento: protectedProcedure
    .input(
      z.object({
        eventoId: z.string().uuid(),
        subeventos: z.array(
          z.object({
            subeventoId: z.string().uuid(),
            fecha: z.string(),
            ubicacion: z.string(),
            nombre: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.evento.update({
        where: {
          id: input.eventoId,
        },
        data: {
          subEventos: {
            createMany: { data: input.subeventos },
          },
        },
      });
    }),
});
