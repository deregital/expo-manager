import { getHighestIdLegible } from '@/lib/server';
import { prisma } from '@/server/db';
import { TipoEtiqueta } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  nombreCompleto: z
    .string({
      required_error: 'El nombre completo es requerido',
    })
    .min(1, 'El nombre completo es requerido'),
  telefono: z
    .string({
      required_error: 'El teléfono es requerido',
    })
    .min(1, 'El teléfono es requerido')
    .regex(/^\+?549(11|[2368]\d)\d{8}$/, 'El teléfono no es válido.'),
  dni: z.string().min(1, 'El DNI es requerido').optional(),
  genero: z.string().min(1, 'El género es requerido').optional(),
  mail: z.string().email('El correo electrónico no es válido').optional(),
  instagram: z.string().min(1, 'El Instagram es requerido').optional(),
  fechaNacimiento: z
    .string()
    .datetime()
    .min(1, 'La fecha de nacimiento es requerida')
    .optional(),
  pais: z.string().min(1, 'El país de nacimiento es requerido'),
  provincia: z.string().min(1, 'La provincia de nacimiento es requerida'),
  provinciaArgentina: z
    .string()
    .min(1, 'La provincia de residencia es requerida'),
  localidad: z.object({
    nombre: z.string().min(1, 'La localidad de residencia es requerida'),
    latitud: z.number().min(-90).max(90),
    longitud: z.number().min(-180).max(180),
  }),
});

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const data = await req.json();
    const parsedData = schema.parse(data);
    const {
      username,
      password,
      nombreCompleto,
      telefono,
      dni,
      genero,
      mail,
      instagram,
      fechaNacimiento,
      pais,
      provincia,
      provinciaArgentina,
      localidad,
    } = parsedData;

    if (!username || !password) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usuario = await prisma.cuenta.findFirst({
      where: {
        nombreUsuario: username,
        contrasena: password,
      },
    });

    if (!usuario || usuario.nombreUsuario !== 'FORMULARIO') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const telefonoSinSeparaciones = telefono
      .replace(/\s+/g, '')
      .replace(/\+/g, '');
    const telefonoExistente = await prisma?.perfil.findFirst({
      where: {
        telefono: telefonoSinSeparaciones,
      },
    });

    if (telefonoExistente) {
      return NextResponse.json(
        {
          error: `No podés anotarte porque tu número ya está en nuestra base de datos. Por favor contactate al siguiente número: https://wa.me/541135208230`,
        },
        { status: 400 }
      );
    }

    const nombrePila = nombreCompleto.split(' ')[0];

    const modeloEtiquetaId = await prisma?.etiqueta.findFirst({
      where: {
        tipo: TipoEtiqueta.MODELO,
      },
      select: {
        id: true,
      },
    });

    const etiquetaTentativaId = await prisma?.etiqueta.findFirst({
      where: {
        tipo: TipoEtiqueta.TENTATIVA,
      },
      select: {
        id: true,
      },
    });

    if (!modeloEtiquetaId || !etiquetaTentativaId) {
      return NextResponse.json(
        { error: 'No se encontró la etiqueta de modelo o de tentativa' },
        { status: 500 }
      );
    }

    const idLegibleMasAlto = await getHighestIdLegible(prisma);

    const response = await prisma?.perfil.upsert({
      where: {
        telefono: telefonoSinSeparaciones,
      },
      update: {
        nombreCompleto,
        nombrePila,
        dni,
        genero,
        mail,
        instagram,
        fechaNacimiento,
        etiquetas: {
          disconnect: {
            id: etiquetaTentativaId.id,
          },
          connect: {
            id: modeloEtiquetaId.id,
          },
        },
      },
      create: {
        idLegible: idLegibleMasAlto + 1,
        nombreCompleto,
        nombrePila,
        telefono: telefonoSinSeparaciones,
        dni,
        genero,
        mail,
        instagram,
        fechaNacimiento,
        etiquetas: {
          connect: {
            id: modeloEtiquetaId.id,
          },
        },
      },
    });

    const responseLocalidad = await prisma?.residencia.findFirst({
      where: {
        latitud: localidad.latitud,
        longitud: localidad.longitud,
      },
      select: {
        id: true,
      },
    });
    if (responseLocalidad && responseLocalidad.id) {
      await prisma?.perfil.update({
        where: {
          id: response.id,
        },
        data: {
          residencia: {
            connect: {
              id: responseLocalidad.id,
            },
          },
        },
      });
    } else {
      await prisma?.residencia.create({
        data: {
          latitud: localidad.latitud,
          longitud: localidad.longitud,
          localidad: localidad.nombre,
          provincia: provinciaArgentina,
          perfiles: {
            connect: {
              id: response.id,
            },
          },
        },
      });
    }
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating new profile:', error);
    return NextResponse.json(
      { error: 'Error creating new profile' },
      { status: 500 }
    );
  }
}
