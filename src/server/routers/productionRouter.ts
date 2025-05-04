import { handleError, protectedProcedure, router } from '@/server/trpc';
import {
  createProductionSchema,
  productionSchema,
  updateProductionSchema,
} from 'expo-backend-types';

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
  edit: protectedProcedure
    .input(updateProductionSchema.extend({ id: productionSchema.shape.id }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.fetch.PATCH('/production/update/{id}', {
        params: {
          path: {
            id: input.id,
          },
        },
        body: {
          name: input.name,
          administratorId: input.administratorId,
        },
      });

      if (error) {
        throw handleError(error);
      }
      return data;
    }),
});
