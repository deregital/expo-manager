import { protectedProcedure, router } from '@/server/trpc';

export const mapaRouter = router({
  getLocations: protectedProcedure.query(async ({ ctx }) => {
    const locations = await ctx.prisma.residencia.findMany({
      select: {
        id: true,
        latitud: true,
        longitud: true,
        localidad: true,
      },
    });
    return locations;
  }),
});
