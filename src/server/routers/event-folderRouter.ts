import { handleError, protectedProcedure, router } from '@/server/trpc';
import {
  createEventFolderSchema,
  eventFolderSchema,
  updateEventFolderSchema,
} from 'expo-backend-types';
import { z } from 'zod';

export const eventFolderRouter = router({
  create: protectedProcedure
    .input(createEventFolderSchema)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.POST('/event-folder/create', {
        body: input,
      });
      if (error) throw handleError(error);
      return data;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.fetch.GET('/event-folder/all');
    if (error) throw handleError(error);
    return data.eventFolders;
  }),

  getById: protectedProcedure
    .input(eventFolderSchema.shape.id)
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.GET(`/event-folder/{id}`, {
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
      updateEventFolderSchema.merge(
        z.object({ id: eventFolderSchema.shape.id })
      )
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...body } = input;
      const { data, error } = await ctx.fetch.PATCH(
        `/event-folder/update/{id}`,
        {
          params: {
            path: {
              id,
            },
          },
          body: body,
        }
      );
      if (error) throw handleError(error);
      return data;
    }),

  delete: protectedProcedure
    .input(eventFolderSchema.shape.id)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.DELETE(
        `/event-folder/delete/{id}`,
        {
          params: {
            path: {
              id: input,
            },
          },
        }
      );
      if (error) throw handleError(error);
      return data;
    }),
});
