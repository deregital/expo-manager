import { protectedProcedure, publicProcedure, router } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';


export const whatsappRouter = router({
    createTemplate: publicProcedure.input(z.object({
        name: z.string().min(1).max(512).toLowerCase().trim(),
        content: z.string().max(768).min(1),
    })).mutation(async ({ input, ctx }) => {
        await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_BUSINESS_ID}/message_templates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
            },
            body: JSON.stringify(
                {
                    "name": `${input.name}`,	
                    "category": "UTILITY",
                    "allow_category_change": true,
                    "language": "es_AR",
                    "components": [
                        {
                            "type": "BODY",
                            "text": `${input.content}`
                        },
                    ],
                },
            ),
        });
        const contenido = JSON.stringify(
            {
                "name": `${input.name}`,	
                "category": "UTILITY",
                "allow_category_change": true,
                "language": "es_AR",
                "components": [
                    {
                        "type": "BODY",
                        "text": `${input.content}`
                    },
                ],
            },
        );
        return await ctx.prisma.plantilla.create({
            data: {
                titulo: input.name,
                contenido: contenido,
                estado: 'PENDIENTE',
                categoria: 'UTILIDAD'

            }
        });
    }),
    sendMessage: publicProcedure.input(z.object({
        etiquetas: z.string().array(),
        plantillaName: z.string(),
    })).mutation(async ({ input, ctx }) => {
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
            await fetch(`https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
                },
                body: JSON.stringify(
                    {
                        "messaging_product": "whatsapp",
                        "to": `${telefono.telefono}`,
                        "type": "template",
                        "template": {
                            "name": `${input.plantillaName}`,
                            "language": {
                                "code": "es_AR"
                            },
                        },
                    },
                ),
            });
        });
        return 'Mensajes enviados';
    }),
})