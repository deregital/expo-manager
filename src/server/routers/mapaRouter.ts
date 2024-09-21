import { protectedProcedure, router } from '@/server/trpc';

export const mapaRouter = router({
  getLocations: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.residencia.findMany({
      where: {
        // where it has some perfil associated
        perfiles: {
          some: {
            esPapelera: false,
          },
        },
      },
      select: {
        latitud: true,
        longitud: true,
        localidad: true,
        _count: {
          select: {
            perfiles: true,
          },
        },
      },
    });
  }),
});
