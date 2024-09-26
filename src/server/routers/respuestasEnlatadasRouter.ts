import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

const respuestasEnlatadasSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
});

export const respuestasEnlatadasRouter = router({
  create: publicProcedure
    .input(respuestasEnlatadasSchema)
    .mutation(async ({ input, ctx }) => {
      const nuevaRespuesta = await ctx.prisma.respuestasEnlatadas.create({
        data: {
          nombre: input.nombre,
          descripcion: input.descripcion,
        },
      });
      return nuevaRespuesta;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        nombre: z.string().min(1, 'El nombre es obligatorio'),
        descripcion: z.string().min(1, 'La descripción es obligatoria'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const respuestaActualizada = await ctx.prisma.respuestasEnlatadas.update({
        where: { id: input.id },
        data: {
          nombre: input.nombre,
          descripcion: input.descripcion,
        },
      });
      return respuestaActualizada;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.respuestasEnlatadas.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
});
