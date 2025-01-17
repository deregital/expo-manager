import { handleError, protectedProcedure, router } from '@/server/trpc';
import { z } from 'zod';
import {
  createTagSchema,
  massiveAllocationSchema,
  massiveDeallocationSchema,
  tagGroupSchema,
  tagSchema,
  updateTagSchema,
} from 'expo-backend-types';

export const tagRouter = router({
  create: protectedProcedure
    .input(createTagSchema)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.POST('/tag/create', {
        body: input,
      });

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
  delete: protectedProcedure
    .input(tagSchema.shape.id)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.DELETE('/tag/{id}', {
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
  edit: protectedProcedure
    .input(
      updateTagSchema.merge(
        z.object({
          id: tagSchema.shape.id,
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.PATCH('/tag/{id}', {
        params: {
          path: {
            id: input.id,
          },
        },
        body: {
          name: input.name,
          groupId: input.groupId,
        },
      });

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.fetch.GET('/tag/all');
    if (error) {
      throw handleError(error);
    }

    return data?.tags || [];
  }),
  getById: protectedProcedure
    .input(tagSchema.shape.id)
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.GET('/tag/{id}', {
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
  getByGroupId: protectedProcedure
    .input(tagGroupSchema.shape.id)
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.GET(
        '/tag/find-by-group/{groupId}',
        {
          params: {
            path: {
              groupId: input,
            },
          },
        }
      );

      if (error) {
        throw handleError(error);
      }

      return data?.tags || [];
    }),
  getByNombre: protectedProcedure.query(async ({ input, ctx }) => {
    const { data } = await ctx.fetch.GET('/tag-group/all-with-tags');

    return data?.groups;
  }),
  massiveAllocation: protectedProcedure
    .input(massiveAllocationSchema)
    .mutation(async ({ input, ctx }) => {
      const { error, data } = await ctx.fetch.POST('/tag/massive-allocation', {
        body: input,
      });

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
  masiveDeallocation: protectedProcedure
    .input(massiveDeallocationSchema)
    .mutation(async ({ input, ctx }) => {
      const { error, data } = await ctx.fetch.POST(
        '/tag/massive-deallocation',
        {
          body: input,
        }
      );

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
});
