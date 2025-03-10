import { handleError, protectedProcedure, router } from '@/server/trpc';
import { createTicketSchema, eventSchema } from 'expo-backend-types';

export const ticketRouter = router({
  getByEventId: protectedProcedure
    .input(eventSchema.shape.id)
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.GET(
        '/ticket/find-by-event/{eventId}',
        {
          params: {
            path: {
              eventId: input,
            },
          },
        }
      );

      if (error) {
        throw handleError(error);
      }

      return data.tickets;
    }),

  create: protectedProcedure
    .input(createTicketSchema)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.POST('/ticket/create', {
        body: input,
      });

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
});
