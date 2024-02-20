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
})