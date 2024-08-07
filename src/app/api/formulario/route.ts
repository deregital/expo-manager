import { getHighestIdLegible } from '@/lib/server';
import { prisma } from '@/server/db';
import { TipoEtiqueta } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  nombreCompleto: z.string().min(1, 'El nombre completo es requerido'),
  telefono: z.string().min(1, 'El teléfono es requerido'),
  dni: z.string().min(1, 'El DNI es requerido'),
  genero: z.string().min(1, 'El género es requerido'),
  mail: z.string().email('El correo electrónico no es válido'),
  instagram: z.string().min(1, 'El Instagram es requerido'),
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
        { error: 'El teléfono ya está registrado' },
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
        etiquetas: {
          connect: {
            id: modeloEtiquetaId.id,
          },
        },
      },
    });

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
