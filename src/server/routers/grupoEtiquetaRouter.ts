import { handleError, protectedProcedure, router } from '@/server/trpc';
import {
  createTagGroupSchema,
  tagGroupSchema,
  updateTagGroupSchema,
} from 'expo-backend-types';
import { z } from 'zod';

export const grupoEtiquetaRouter = router({
  create: protectedProcedure
    .input(createTagGroupSchema)
    .mutation(async ({ input, ctx }) => {
      const { data } = await ctx.fetch.POST('/tag-group/create', {
        body: input,
      });

      return data;
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.fetch.GET('/tag-group/all');
    return data?.tagGroups || [];
  }),
  edit: protectedProcedure
    .input(
      z.object({
        id: tagGroupSchema.shape.id,
        dto: updateTagGroupSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.PATCH('/tag-group/{id}', {
        params: {
          path: {
            id: input.id,
          },
        },
        body: input.dto,
      });

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
  delete: protectedProcedure
    .input(tagGroupSchema.shape.id)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.DELETE('/tag-group/{id}', {
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
