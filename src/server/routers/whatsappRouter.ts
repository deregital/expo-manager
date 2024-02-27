import { protectedProcedure, router } from '@/server/trpc';
import { z } from 'zod';
import {
  Template,
  Buttons,
  TemplateResponse,
  TemplateEdit,
  TemplateEditResponse,
} from '@/server/types/whatsapp';

export const whatsappRouter = router({
  createTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(512).toLowerCase().trim(),
        content: z.string().max(768).min(1),
        buttons: z.array(z.string().max(25)).max(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const contenido: Template = {
        name: `${input.name}`,
        category: 'UTILITY',
        allow_category_change: true,
        language: 'es_AR',
        components: [
          {
            type: 'BODY',
            text: `${input.content}`,
          },
        ],
      };

      let buttons_json: Buttons = {
        buttons: [],
        type: 'BUTTONS',
      };

      if (input.buttons.length > 0) {
        input.buttons.forEach((button) => {
          const each_button = {
            text: `${button}`,
            type: 'QUICK_REPLY',
          } satisfies Buttons['buttons'][number];
          buttons_json.buttons.push(each_button);
        });
        contenido.components.push(buttons_json);
      }

      const res: TemplateResponse = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_BUSINESS_ID}/message_templates`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
          },
          body: JSON.stringify(contenido),
        }
      ).then((res) => res.json());
      return await ctx.prisma.plantilla.create({
        data: {
          titulo: input.name,
          contenido: JSON.stringify(contenido),
          metaId: res.id,
          estado: res.status,
          categoria: res.category,
        },
      });
    }),
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.plantilla.findMany();
  }),
  getTemplateById: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.plantilla.findUnique({
        where: {
          id: input,
        },
      });
    }),
  editTemplate: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        metaId: z.string(),
        content: z.string().max(768).min(1),
        buttons: z.array(z.string().max(25)).max(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const contenido: TemplateEdit = {
        components: [
          {
            type: 'BODY',
            text: `${input.content}`,
          },
        ],
      };

      let buttons_json: Buttons = {
        buttons: [],
        type: 'BUTTONS',
      };

      if (input.buttons.length > 0) {
        input.buttons.forEach((button) => {
          const each_button = {
            text: `${button}`,
            type: 'QUICK_REPLY',
          } satisfies Buttons['buttons'][number];
          buttons_json.buttons.push(each_button);
        });
        contenido.components.push(buttons_json);
      }

      const res: TemplateEditResponse = await fetch(
        `https://graph.facebook.com/v18.0/${input.metaId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
          },
          body: JSON.stringify(contenido),
        }
      ).then((res) => res.json());
      if (res.success === true) {
        await ctx.prisma.plantilla.update({
          where: {
            id: input.id,
          },
          data: {
            contenido: JSON.stringify(contenido),
          },
        });
      }
      return res.success;
    }),
  deleteTemplate: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      await fetch(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_BUSINESS_ID}/message_templates?name=${input}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
          },
        }
      );
      return await ctx.prisma.plantilla.delete({
        where: {
          titulo: input,
        },
      });
    }),
  sendMessage: protectedProcedure
    .input(
      z.object({
        etiquetas: z.string().array(),
        plantillaName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const telefonos = await ctx.prisma.perfil.findMany({
        where: {
          etiquetas: {
            some: {
              id: { in: input.etiquetas },
            },
          },
        },
        select: {
          telefono: true,
        },
      });
      telefonos.forEach(async (telefono) => {
        await fetch(
          `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: `${telefono.telefono}`,
              type: 'template',
              template: {
                name: `${input.plantillaName}`,
                language: {
                  code: 'es_AR',
                },
              },
            }),
          }
        );
      });
      return 'Mensajes enviados';
    }),
});
