import { handleError, protectedProcedure, router } from '@/server/trpc';
import {
  createRoleSchema,
  tagSchema,
  updateRoleSchema,
} from 'expo-backend-types';
import { z } from 'zod';

export const roleRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.fetch.GET('/role/all');

    if (error) {
      throw handleError(error);
    }

    return data;
  }),
  create: protectedProcedure
    .input(createRoleSchema)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.POST('/role/create', {
        body: input,
      });

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: tagSchema.shape.id,
        input: updateRoleSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.PATCH('/role/{id}', {
        body: input.input,
        params: {
          path: {
            id: input.id,
          },
        },
      });

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
  delete: protectedProcedure
    .input(tagSchema.shape.id)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.DELETE('/role/{id}', {
        params: {
          path: {
            id: input,
          },
        },
      });

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
});
