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
      const sub = input.subEvents?.map((sub) => ({
        ...sub,
        date: sub.date.toISOString(),
        startingDate: sub.startingDate.toISOString(),
        endingDate: sub.endingDate.toISOString(),
      }));

      const { data, error } = await ctx.fetch.POST('/event/create', {
        body: {
          ...input,
          date: input.date.toISOString(),
          startingDate: input.startingDate.toISOString(),
          endingDate: input.endingDate.toISOString(),
          subEvents: sub,
        },
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
      const sub = input.subEvents?.map((sub) => ({
        ...sub,
        date: sub.date.toISOString(),
        startingDate: sub.startingDate.toISOString(),
        endingDate: sub.endingDate.toISOString(),
      }));

      const { data, error } = await ctx.fetch.PATCH('/event/{id}', {
        params: {
          path: {
            id: id,
          },
        },
        body: {
          ...body,
          date: input.date.toISOString(),
          startingDate: input.startingDate.toISOString(),
          endingDate: input.endingDate.toISOString(),
          subEvents: sub,
        },
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
