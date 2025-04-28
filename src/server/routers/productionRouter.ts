import { handleError, protectedProcedure, router } from '@/server/trpc';
import { createProductionSchema } from 'expo-backend-types';

export const productionRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.fetch.GET('/production/all');

    if (error) {
      throw handleError(error);
    }

    return data;
  }),
  create: protectedProcedure
    .input(createProductionSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.fetch.POST('/production/create', {
        body: input,
      });

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
});
