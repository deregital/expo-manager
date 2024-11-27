import { handleError, protectedProcedure, router } from '@/server/trpc';
import { z } from 'zod';
import {
  createTemplateSchema,
  profileSchema,
  sendMessageToPhoneSchema,
  sendTemplateToTagsSchema,
  templateSchema,
  updateTemplateSchema,
} from 'expo-backend-types';

export const messageRouter = router({
  createTemplate: protectedProcedure
    .input(createTemplateSchema)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.POST('/message/create-template', {
        body: input,
      });

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
  findTemplates: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.fetch.GET('/message/templates');

    if (error) {
      throw handleError(error);
    }

    return data;
  }),
  findTemplateById: protectedProcedure
    .input(templateSchema.shape.id)
    .query(async ({ input, ctx }) => {
      if (input === undefined) {
        return undefined;
      }
      const { data, error } = await ctx.fetch.GET('/message/template/{id}', {
        params: {
          path: {
            id: input,
          },
        },
      });

      if (error) {
        throw handleError(error);
      }

      return data.template;
    }),
  updateTemplate: protectedProcedure
    .input(
      updateTemplateSchema.merge(z.object({ id: templateSchema.shape.id }))
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...body } = input;
      const { data, error } = await ctx.fetch.PATCH(
        '/message/template/{metaId}',
        {
          params: {
            path: {
              metaId: id,
            },
          },
          body,
        }
      );

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
  deleteTemplate: protectedProcedure
    .input(templateSchema.shape.id)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.DELETE(
        '/message/template/{metaId}',
        {
          params: {
            path: {
              metaId: input,
            },
          },
        }
      );
      if (error) {
        throw handleError(error);
      }

      return data;
    }),
  sendMessageToPhone: protectedProcedure
    .input(sendMessageToPhoneSchema)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.POST(
        '/message/send-message-to-phone',
        {
          body: input,
        }
      );

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
  sendMessageToTags: protectedProcedure
    .input(sendTemplateToTagsSchema)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.POST(
        '/message/send-template-to-tags',
        {
          body: input,
        }
      );

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
  findMessagesByPhone: protectedProcedure
    .input(profileSchema.shape.phoneNumber)
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.GET(
        '/message/find-messages-by-phone/{phone}',
        {
          params: {
            path: {
              phone: input,
            },
          },
        }
      );

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
  getLastMessageTimestamp: protectedProcedure
    .input(profileSchema.shape.phoneNumber)
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.GET(
        '/message/last-message-timestamp/{phone}',
        {
          params: {
            path: {
              phone: input,
            },
          },
        }
      );

      if (error) {
        throw handleError(error);
      }

      return data;
    }),
  readMessages: protectedProcedure
    .input(profileSchema.shape.phoneNumber)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.fetch.POST(
        '/message/read-messages/{phone}',
        {
          params: {
            path: {
              phone: input,
            },
          },
        }
      );
      if (error) {
        throw handleError(error);
      }

      return data;
    }),
  nonReadMessages: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.fetch.GET('/message/non-read-messages');

    if (error) {
      throw handleError(error);
    }

    return data;
  }),
});
