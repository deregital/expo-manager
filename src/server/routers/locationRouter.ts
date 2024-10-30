import { handleError, protectedProcedure, router } from '@/server/trpc';
import { z } from 'zod';

export const locationRouter = router({
  getLocations: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.fetch.GET('/location/all');

    if (error) {
      handleError(error);
    }

    return data;
  }),
  getCitiesByArgState: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.fetch.GET(
        `/location/find-cities-by-arg-state/{argState}`,
        {
          params: {
            path: {
              argState: input,
            },
          },
        }
      );

      if (error) {
        handleError(error);
      }

      return data?.cities ?? [];
    }),
  getArgStates: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.fetch.GET('/location/arg-states');

    if (error) {
      handleError(error);
    }

    return data.states;
  }),
  getCountries: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.fetch.GET('/location/all-countries');

    if (error) {
      handleError(error);
    }

    return data.countries;
  }),
  getStateByCountry: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.fetch.GET(
        `/location/states-by-country/{countryCode}`,
        {
          params: {
            path: {
              countryCode: input,
            },
          },
        }
      );

      if (error) {
        handleError(error);
      }

      return data?.states ?? [];
    }),
});
