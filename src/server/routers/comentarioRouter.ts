import { protectedProcedure, publicProcedure, router } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const comentarioRouter = router({
    create: protectedProcedure
    .input(
      z.object({
        contenido: z.string().min(1),
        perfilId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {

        const userId = ctx.session?.user?.id; 
        if (!userId) {
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Usuario no autenticado' }); 
          }
        

        return await ctx.prisma.comentario.create({
          data: {
            contenido: input.contenido,
            perfilId: input.perfilId,  
            creadoPor: userId, 
          },
        });
  
      }),

      read: protectedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          contenido: z.string(),
          perfilId: z.string(),
          creadoPor: z.string(),
        })
      )
    )
    .query(async ({ ctx }) => {
      return await ctx.prisma.comentario.findMany(); //  todos los comentarios
    }),



  });






