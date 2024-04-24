import { protectedProcedure, router } from '@/server/trpc';
import { TipoEtiqueta } from '@prisma/client';
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
      const grupoEtiquetasEvento = await ctx.prisma.etiquetaGrupo.create({
        data: {
          nombre: input.nombre,
          esExclusivo: true,
          color: '#666666',
        },
      });

      // creamos los subeventos con sus respectivas etiquetas
      const subeventos = await Promise.all(
        input.subeventos.map(async (subevento) => {
          const grupoEtiquetaSubevento = await ctx.prisma.etiquetaGrupo.create({
            data: {
              nombre: subevento.nombre,
              esExclusivo: true,
              color: '#666666',
            },
          });

          return await ctx.prisma.evento.create({
            data: {
              nombre: subevento.nombre,
              fecha: subevento.fecha,
              ubicacion: subevento.ubicacion,
              etiquetaAsistio: {
                create: {
                  grupo: {
                    connect: {
                      id: grupoEtiquetaSubevento.id,
                    },
                  },
                  nombre: `${subevento.nombre} - Asistió`,
                  tipo: TipoEtiqueta.EVENTO,
                },
              },
              etiquetaConfirmo: {
                create: {
                  grupo: {
                    connect: {
                      id: grupoEtiquetaSubevento.id,
                    },
                  },
                  nombre: `${subevento.nombre} - Confirmó asistencia`,
                  tipo: TipoEtiqueta.EVENTO,
                },
              },
            },
          });
        })
      );

      return await ctx.prisma.evento.create({
        data: {
          nombre: input.nombre,
          fecha: input.fecha,
          ubicacion: input.ubicacion,
          etiquetaAsistio: {
            create: {
              grupo: {
                connect: {
                  id: grupoEtiquetasEvento.id,
                },
              },
              nombre: `${input.nombre} - Asistió`,
              tipo: TipoEtiqueta.EVENTO,
            },
          },
          etiquetaConfirmo: {
            create: {
              grupo: {
                connect: {
                  id: grupoEtiquetasEvento.id,
                },
              },
              nombre: `${input.nombre} - Confirmó asistencia`,
              tipo: TipoEtiqueta.EVENTO,
            },
          },
          subEventos: {
            connect: subeventos.map((subevento) => ({
              id: subevento.id,
            })),
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
      const evento = await ctx.prisma.evento.update({
        where: {
          id: input.id,
        },
        data: {
          nombre: input.nombre,
          fecha: input.fecha,
          ubicacion: input.ubicacion,
        },
        select: {
          etiquetaAsistio: {
            include: {
              grupo: {
                select: {
                  id: true,
                },
              },
            },
          },
          etiquetaConfirmo: {
            select: { id: true },
          },
        },
      });

      await ctx.prisma.etiquetaGrupo.update({
        where: {
          id: evento.etiquetaAsistio.grupo.id,
        },
        data: {
          nombre: input.nombre,
        },
      });

      await ctx.prisma.etiqueta.update({
        where: {
          id: evento.etiquetaAsistio.id,
        },
        data: {
          nombre: `${input.nombre} - Asistió`,
        },
      });

      await ctx.prisma.etiqueta.update({
        where: {
          id: evento.etiquetaConfirmo.id,
        },
        data: {
          nombre: `${input.nombre} - Confirmó asistencia`,
        },
      });

      const subeventos = await ctx.prisma.evento.findMany({
        where: {
          eventoPadreId: input.id,
        },
        include: {
          etiquetaAsistio: true,
          etiquetaConfirmo: true,
        },
      });

      const subEventosEliminados = subeventos.filter(
        (subevento) => !input.subeventos.some((sub) => sub.id === subevento.id)
      );

      input.subeventos.forEach(async (subevento) => {
        let grupoEtiquetasSubeventoId: string;
        if (subeventos.map((sub) => sub.id).includes(subevento.id)) {
          // Si el subevento ya existe, acutalizamos el grupo de etiquetas junto con sus etiquetas
          const inputSubevento = subeventos.find(
            (sub) => sub.id === subevento.id
          );

          if (!inputSubevento) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Subevento no encontrado',
            });
          }

          await ctx.prisma.etiquetaGrupo.update({
            where: {
              id: inputSubevento.etiquetaAsistio.grupoId,
            },
            data: {
              nombre: subevento.nombre,
            },
          });
          await ctx.prisma.etiqueta.update({
            where: {
              id: inputSubevento.etiquetaAsistio.id,
            },
            data: {
              nombre: `${subevento.nombre} - Asistió`,
            },
          });
          await ctx.prisma.etiqueta.update({
            where: {
              id: inputSubevento.etiquetaConfirmo.id,
            },
            data: {
              nombre: `${subevento.nombre} - Confirmó asistencia`,
            },
          });

          grupoEtiquetasSubeventoId = inputSubevento.etiquetaAsistio.grupoId;
        } else {
          // create grupo de etiquetas:
          const grupoEtiquetasSubevento = await ctx.prisma.etiquetaGrupo.create(
            {
              data: {
                nombre: subevento.nombre,
                esExclusivo: true,
                color: '#666666',
              },
            }
          );
          grupoEtiquetasSubeventoId = grupoEtiquetasSubevento.id;
        }

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
            etiquetaAsistio: {
              create: {
                grupo: {
                  connect: {
                    id: grupoEtiquetasSubeventoId,
                  },
                },
                nombre: `${subevento.nombre} - Asistió`,
                tipo: TipoEtiqueta.EVENTO,
              },
            },
            etiquetaConfirmo: {
              // same as above
              create: {
                grupo: {
                  connect: {
                    id: grupoEtiquetasSubeventoId,
                  },
                },
                nombre: `${subevento.nombre} - Confirmó asistencia`,
                tipo: TipoEtiqueta.EVENTO,
              },
            },
          },
        });
      });

      // Eliminar los subeventos que no se encuentren en la lista de subeventos
      subEventosEliminados.forEach(async (subevento) => {
        const grupoEtiquetaId = subevento.etiquetaAsistio.grupoId;
        await ctx.prisma.evento.delete({
          where: {
            id: subevento.id,
          },
        });

        await ctx.prisma.etiquetaGrupo.delete({
          where: {
            id: grupoEtiquetaId,
          },
        });
      });

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
});
