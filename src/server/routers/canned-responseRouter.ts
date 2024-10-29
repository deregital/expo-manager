import { z } from 'zod';
import { router, protectedProcedure, handleError } from '../trpc';
import {
  cannedResponseSchema,
  createCannedResponseSchema,
  updateCannedResponseSchema,
} from 'expo-backend-types';

export const cannedResponseRouter = router({
  create: protectedProcedure
    .input(createCannedResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.POST('/canned-response/create', {
        body: input,
      });
      if (error) {
        throw handleError(error);
      }
      return data;
    }),

  update: protectedProcedure
    .input(
      updateCannedResponseSchema.merge(
        z.object({ id: cannedResponseSchema.shape.id })
      )
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...body } = input;
      const { data, error } = await ctx.fetch.PATCH(
        '/canned-response/update/{id}',
        {
          params: {
            path: {
              id: id,
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

  delete: protectedProcedure
    .input(cannedResponseSchema.shape.id)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.DELETE(
        '/canned-response/delete/{id}',
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

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.fetch.GET('/canned-response/all');
    if (error) {
      throw handleError(error);
    }
    return data.cannedResponses;
  }),
});
