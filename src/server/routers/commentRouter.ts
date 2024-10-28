import { handleError, protectedProcedure, router } from '@/server/trpc';
import { commentSchema, createCommentSchema } from 'expo-backend-types';

export const commentRouter = router({
  create: protectedProcedure
    .input(createCommentSchema)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.POST('/comment/create', {
        body: input,
      });
      if (error) {
        throw handleError(error);
      }
      return data;
    }),
  getByProfileId: protectedProcedure
    .input(commentSchema.shape.id)
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.GET(
        '/comment/get-by-profile/{id}',
        {
          params: {
            path: {
              id: input,
            },
          },
        }
      );
      if (error) {
        throw handleError(error);
      }

      return data;
    }),
  toggleSolve: protectedProcedure
    .input(commentSchema.shape.id)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.PATCH(
        '/comment/toggle-solve/{id}',
        {
          params: {
            path: {
              id: input,
            },
          },
        }
      );

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
});
