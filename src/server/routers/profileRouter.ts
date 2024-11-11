import { handleError, protectedProcedure, router } from '@/server/trpc';
import { z } from 'zod';
import {
  createProfileSchema,
  profileSchema,
  tagGroupSchema,
  tagSchema,
  updateProfileSchema,
} from 'expo-backend-types';

export const profileRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.fetch.GET('/profile/all');

    return data?.profiles ?? [];
  }),
  getAllWithActiveChat: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.fetch.GET('/profile/all-with-active-chat');

    return data?.profiles ?? [];
  }),
  getById: protectedProcedure
    .input(profileSchema.shape.id)
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.GET(`/profile/{id}`, {
        params: {
          path: {
            id: input,
          },
        },
      });

      if (error) throw handleError(error);

      return data;
    }),
  getByTags: protectedProcedure
    .input(z.array(tagSchema.shape.id))
    .query(async ({ input, ctx }) => {
      const { error, data } = await ctx.fetch.GET('/profile/find-by-tags', {
        params: {
          query: {
            tags: input,
          },
        },
      });

      if (error) throw handleError(error);

      return data?.profiles ?? [];
    }),
  getByTagGroups: protectedProcedure
    .input(z.array(tagGroupSchema.shape.id))
    .query(async ({ input, ctx }) => {
      const { error, data } = await ctx.fetch.GET(
        '/profile/find-by-tag-groups',
        {
          params: {
            query: {
              tagGroups: input,
            },
          },
        }
      );

      if (error) throw handleError(error);

      return data?.profiles ?? [];
    }),
  create: protectedProcedure
    .input(createProfileSchema)
    .mutation(async ({ input, ctx }) => {
      const birthDate = input.profile.birthDate?.toISOString() ?? null;

      const { data, error } = await ctx.fetch.POST('/profile/create', {
        body: {
          checkForSimilarity: input.checkForSimilarity,
          profile: {
            ...input.profile,
            birthDate,
          },
        },
      });

      if (error) throw handleError(error);

      return data!.response;
    }),
  delete: protectedProcedure
    .input(profileSchema.shape.id)
    .mutation(async ({ input, ctx }) => {
      const { error, data } = await ctx.fetch.DELETE(`/profile/{id}`, {
        params: {
          path: {
            id: input,
          },
        },
      });

      if (error) throw handleError(error);

      return data;
    }),
  edit: protectedProcedure
    .input(
      updateProfileSchema.extend({
        id: profileSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const birthDate = input.birthDate?.toISOString() ?? null;
      const movedToTrashDate = input.movedToTrashDate?.toISOString() ?? null;

      const { error, data } = await ctx.fetch.PATCH(`/profile/{id}`, {
        params: {
          path: {
            id: input.id,
          },
        },
        body: {
          ...input,
          movedToTrashDate: movedToTrashDate,
          birthDate: birthDate,
        },
      });

      if (error) throw handleError(error);

      return data;
    }),
  getByDateRange: protectedProcedure
    .input(
      z.object({
        from: z.string(),
        to: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { error, data } = await ctx.fetch.GET(
        '/profile/find-by-date-range',
        {
          params: {
            query: input,
          },
        }
      );

      if (error) throw handleError(error);

      return data!;
    }),
  getByPhoneNumber: protectedProcedure
    .input(profileSchema.shape.phoneNumber)
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.GET(
        '/profile/find-by-phone-number/{phoneNumber}',
        {
          params: {
            path: {
              phoneNumber: input,
            },
          },
        }
      );

      if (error) throw handleError(error);

      return data;
    }),
  getProfilesInTrash: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.fetch.GET('/profile/find-trash');

    return data?.profiles ?? [];
  }),
});
