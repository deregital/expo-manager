import { protectedProcedure, router } from '@/server/trpc';
import { z } from 'zod';
import fs from 'fs';
import { join as pathJoin } from 'path';
import {
  Template,
  Buttons,
  TemplateResponse,
  TemplateEdit,
  TemplateEditResponse,
  GetTemplatesResponse,
  GetTemplateResponse,
  MessageJson,
} from '@/server/types/whatsapp';
import { TRPCError } from '@trpc/server';
import { subDays } from 'date-fns';
import { Mensaje, PrismaClient } from '@prisma/client';

export const whatsappRouter = router({
  createTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(512).toLowerCase().trim().optional(),
        content: z.string().max(768).min(1).optional(),
        buttons: z.array(z.string().max(25)).max(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.content === undefined || input.content === '') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Por favor ingrese cuerpo del mensaje',
        });
      }
      if (input.name === undefined || input.name === '') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Por favor ingrese el nombre de la plantilla',
        });
      }
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
          if (button !== '') {
            const each_button = {
              text: `${button}`,
              type: 'QUICK_REPLY',
            } satisfies Buttons['buttons'][number];
            buttons_json.buttons.push(each_button);
          }
        });
      }
      if (buttons_json.buttons.length > 0) {
        contenido.components.push(buttons_json);
      }

      const res: TemplateResponse = await fetch(
        `https://graph.facebook.com/v19.0/${process.env.META_WHATSAPP_BUSINESS_ID}/message_templates`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.META_TOKEN}`,
          },
          body: JSON.stringify(contenido),
        }
      ).then((res) => res.json());
      if (res.id) {
        return 'Plantilla creada correctamente';
      } else {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No se pudo crear la plantilla',
        });
      }
    }),
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    const res: GetTemplatesResponse = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.META_WHATSAPP_BUSINESS_ID}/message_templates?fields=name,status`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.META_TOKEN}`,
        },
      }
    ).then((res) => res.json());
    return res;
  }),
  getTemplateById: protectedProcedure
    .input(z.string().optional())
    .query(async ({ input }) => {
      if (input === undefined) {
        return undefined;
      }
      const res = await getTemplateByName(input);
      return res;
    }),
  editTemplate: protectedProcedure
    .input(
      z.object({
        metaId: z.string(),
        content: z.string().max(768).min(1),
        buttons: z.array(z.string().max(25)).max(10),
      })
    )
    .mutation(async ({ input }) => {
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
          if (button !== '') {
            const each_button = {
              text: `${button}`,
              type: 'QUICK_REPLY',
            } satisfies Buttons['buttons'][number];
            buttons_json.buttons.push(each_button);
          }
        });
      }
      if (buttons_json.buttons.length > 0) {
        contenido.components.push(buttons_json);
      }

      const res: TemplateEditResponse = await fetch(
        `https://graph.facebook.com/v18.0/${input.metaId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.META_TOKEN}`,
          },
          body: JSON.stringify(contenido),
        }
      ).then((res) => res.json());
      if (res.success === true) {
        return res.success;
      } else {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No se pudo editar la plantilla',
        });
      }
    }),
  deleteTemplate: protectedProcedure
    .input(
      z.object({
        titulo: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      if (input.titulo === '') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No se encontró la plantilla a eliminar',
        });
      }
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.META_WHATSAPP_BUSINESS_ID}/message_templates?name=${input.titulo}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${process.env.META_TOKEN}`,
          },
        }
      ).then((res) => res.json());
      if (res.success === true) {
        return res.success;
      } else {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No se pudo eliminar la plantilla',
        });
      }
    }),
  sendMessageToTelefono: protectedProcedure
    .input(
      z.object({
        telefono: z.string(),
        text: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await enviarMensajeUnaSolaVez(
        input.telefono,
        input.text,
        ctx.prisma as PrismaClient
      );

      return 'Message sent';
    }),
  sendMessageToEtiqueta: protectedProcedure
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

      const mensajesParaCrear: {
        id: string;
        templateName: string;
        timestamp: string;
        type: 'template';
        to: string;
      }[] = [];

      await Promise.all(
        telefonos.map(async (telefono) => {
          const res = await fetch(
            `https://graph.facebook.com/v19.0/${process.env.META_WHATSAPP_API_PHONE_NUMBER_ID}/messages`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.META_TOKEN}`,
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

          const resJson: { messages: [{ id: string }] } = await res.json();

          mensajesParaCrear.push({
            id: resJson.messages[0].id,
            templateName: input.plantillaName,
            timestamp: new Date().getTime().toString(),
            type: 'template',
            to: telefono.telefono,
          });
        })
      );

      await ctx.prisma.mensaje.createMany({
        data: mensajesParaCrear.map((mensaje) => ({
          message: mensaje,
          wamId: mensaje.id,
          visto: true,
          perfilTelefono: mensaje.to!,
        })),
      });
      return 'Mensajes enviados';
    }),
  getMessagesByTelefono: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const mensajes = await ctx.prisma.mensaje.findMany({
        where: {
          perfilTelefono: input,
        },
        orderBy: {
          created_at: 'asc',
        },
      });

      return {
        inChat:
          mensajes.length > 0 &&
          mensajes.some(
            (m) =>
              m.created_at > subDays(new Date(), 1) &&
              (m.message as MessageJson).from === input
          ),
        mensajes,
      } as {
        inChat: boolean;
        mensajes: (Omit<Mensaje, 'message'> & {
          message: MessageJson;
        })[];
      };
    }),
  getLastMessageTimestamp: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const path =
        process.env.NODE_ENV === 'production'
          ? '/tmp/storeLastMessage.json'
          : pathJoin(process.cwd(), '/src/server/storeLastMessage.json');

      const doesFileExist = fs.existsSync(path);

      if (!doesFileExist) {
        fs.writeFileSync(path, '[]', 'utf8');
      }

      const file = fs.readFileSync(path, 'utf-8');

      const myEntry = JSON.parse(file).find(
        (entry: { waId: string }) => entry.waId === input
      );

      if (!myEntry) {
        return new Date().getTime();
      }

      return myEntry.timestamp as number;
    }),
  readMensajes: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.mensaje.updateMany({
        where: {
          perfilTelefono: input,
          visto: false,
        },
        data: {
          visto: true,
        },
      });
    }),
  mensajesNoLeidos: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.mensaje.groupBy({
      by: ['perfilTelefono'],
      where: {
        visto: false,
      },
      _count: {
        id: true,
      },
    });
  }),
});

export async function enviarMensajeUnaSolaVez(
  telefono: string,
  text: string,
  db: PrismaClient
) {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${process.env.META_WHATSAPP_API_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.META_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: `${telefono}`,
        type: 'text',
        text: {
          body: `${text}`,
        },
      }),
    }
  );

  if (!res.ok) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to send message',
    });
  }

  const resJson = await res.json();

  const messageId = (
    resJson as {
      messages: { id: string }[];
    }
  ).messages[0].id;
  await db.mensaje.create({
    data: {
      message: {
        id: messageId,
        text: {
          body: text,
        },
        type: 'text',
        to: telefono,
        timestamp: new Date().getTime(),
      },
      visto: true,
      wamId: messageId,
      perfil: {
        connect: {
          telefono: telefono,
        },
      },
    },
  });

  return res;
}

export async function getTemplateByName(plantillaName: string) {
  const res: GetTemplateResponse = await fetch(
    `https://graph.facebook.com/v19.0/${process.env.META_WHATSAPP_BUSINESS_ID}/message_templates?name=${plantillaName}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.META_TOKEN}`,
      },
    }
  ).then((res) => res.json());
  return res;
}
