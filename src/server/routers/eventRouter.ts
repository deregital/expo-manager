import { handleError, protectedProcedure, router } from '@/server/trpc';
import {
  createEventSchema,
  eventFolderSchema,
  updateEventSchema,
} from 'expo-backend-types';
import { z } from 'zod';

export const eventRouter = router({
  create: protectedProcedure
    .input(createEventSchema)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.POST('/event/create', {
        body: input,
      });
      if (error) throw handleError(error);
      return data;
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.fetch.GET('/event/all');
    if (error) throw handleError(error);
    return data;
  }),
  getById: protectedProcedure
    .input(eventFolderSchema.shape.id)
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.fetch.GET('/event/{id}', {
        params: {
          path: {
            id: input,
          },
        },
      });
      if (error) throw handleError(error);
      return data;
    }),
  update: protectedProcedure
    .input(
      updateEventSchema.merge(z.object({ id: eventFolderSchema.shape.id }))
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...body } = input;
      const { data, error } = await ctx.fetch.PATCH('/event/{id}', {
        params: {
          path: {
            id: id,
          },
        },
        body: body,
      });
      if (error) throw handleError(error);
      return data;
    }),
  delete: protectedProcedure
    .input(eventFolderSchema.shape.id)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.DELETE('/event/{id}', {
        params: {
          path: {
            id: input,
          },
        },
      });
      if (error) throw handleError(error);
      return data;
    }),
});
