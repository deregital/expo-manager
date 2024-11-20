import { handleError, protectedProcedure, router } from '@/server/trpc';
import { updateGlobalFilterSchema } from 'expo-backend-types';

export const accountRouter = router({
  updateGlobalFilter: protectedProcedure
    .input(updateGlobalFilterSchema)
    .mutation(async ({ ctx, input }) => {
      const { data } = await ctx.fetch.PATCH('/account/global-filter', {
        body: input,
      });

      return data!;
    }),
  getGlobalFilter: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.fetch.GET('/account/global-filter');

    if (error) {
      throw handleError(error);
    }

    return data!;
  }),
  getMe: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.fetch.GET('/account/me');

    return data;
  }),
});
