import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const data = await req.json();
        const telefonoSinSeparaciones = data.telefono.replace(/\s+/g, '').replace(/\+/g, '');
        const telefonoExistente = await prisma?.perfil.findFirst({
            where: {
                telefono: telefonoSinSeparaciones
            }
        });
        if (telefonoExistente) {
            return NextResponse.json({error: 'El teléfono ya está registrado'}, {status: 400});
        }
        const nombrePila = data.nombreCompleto.split(' ')[0];
        const response = await prisma?.perfil.create({
            data: {
                nombreCompleto: data.nombreCompleto,
                nombrePila: nombrePila,
                telefono: telefonoSinSeparaciones,
            }
        });
        return NextResponse.json(response, {status: 201});
    } catch (error) {
        console.error('Error creating new profile:', error);
        return NextResponse.json({error: 'Error creating new profile'}, {status: 500});
    }
}