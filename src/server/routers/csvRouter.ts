import { handleError, protectedProcedure, router } from '@/server/trpc';
import {
  downloadAllTablesSchema,
  downloadProfilesSchema,
} from 'expo-backend-types';

export const csvRouter = router({
  downloadProfiles: protectedProcedure
    .input(downloadProfilesSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.fetch.POST('/csv/download-profiles', {
        body: input,
      });
      if (error) throw handleError(error);
      return data;
    }),
  downloadAllTables: protectedProcedure
    .input(downloadAllTablesSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.fetch.POST('/csv/download-all-tables', {
        body: input,
      });
      if (error) throw handleError(error);
      return data;
    }),
});
