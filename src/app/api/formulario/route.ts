import { prisma } from '@/server/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const data = await req.json();
    if (!data.username || !data.password) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const usuario = await prisma.cuenta.findFirst({
      where: {
        nombreUsuario: data.username,
        contrasena: data.password,
      },
    });
    if (!usuario || usuario.nombreUsuario !== "FORMULARIO") {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const telefonoSinSeparaciones = data.telefono
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
    const nombrePila = data.nombreCompleto.split(' ')[0];
    const response = await prisma?.perfil.create({
      data: {
        nombreCompleto: data.nombreCompleto,
        nombrePila: nombrePila,
        telefono: telefonoSinSeparaciones,
        etiquetas: {
          connect: { id: process.env.MODELO_ETIQUETA_ID },
        },
      },
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating new profile:', error);
    return NextResponse.json(
      { error: 'Error creating new profile' },
      { status: 500 }
    );
  }
}
