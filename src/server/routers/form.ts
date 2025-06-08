import { handleError, protectedProcedure, router } from '@/server/trpc';

export const formRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.fetch.GET('/dynamic-form/all');

    if (error) {
      throw handleError(error);
    }

    return data;
  }),
});
