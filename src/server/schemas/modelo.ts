import { z } from 'zod';

export const modeloSchemaCrearOEditar = z.object({
  nombreCompleto: z.string().min(1, 'El nombre es un campo obligatorio'),
  telefono: z
    .string()
    .min(1, {
      message: 'El teléfono es un campo obligatorio',
    })
    .regex(
      /^\+?549(11|[2368]\d)\d{8}$/,
      'El número de teléfono debe tener 10 dígitos. Puede empezar con 549'
    ),
  genero: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  fotoUrl: z.string().optional().nullable(),
  etiquetas: z.array(z.string().uuid()).optional(),
  apodos: z.array(z.string()).optional(),
  dni: z.string().optional(),
  mail: z.union([
    z.literal(''),
    z.string().email('El mail debe tener un formato válido'),
  ]),
  instagram: z.string().optional(),
});
