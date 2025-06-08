import { handleError, protectedProcedure, router } from '@/server/trpc';
import {
  createDynamicFormSchema,
  dynamicFormSchema,
  updateDynamicFormSchema,
} from 'expo-backend-types';

export const formRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.fetch.GET('/dynamic-form/all');

    if (error) {
      throw handleError(error);
    }

    return data;
  }),
  edit: protectedProcedure
    .input(
      updateDynamicFormSchema.extend({
        id: dynamicFormSchema.shape.id,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...body } = input;
      const { data, error } = await ctx.fetch.PATCH(
        '/dynamic-form/update/{id}',
        {
          params: {
            path: {
              id,
            },
          },
          body: body,
        }
      );

      if (error) {
        throw handleError(error);
      }

      return data;
    }),

  create: protectedProcedure
    .input(createDynamicFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.fetch.POST('/dynamic-form/create', {
        body: input,
      });

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
});
