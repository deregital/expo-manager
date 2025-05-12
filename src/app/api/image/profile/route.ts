import { type NextRequest, NextResponse } from 'next/server';
import { fetchClient } from '@/server/fetchClient';

export async function POST(req: NextRequest, res: NextResponse) {
  const form = await req.formData();
  const filepath = form.get('imagen') as File;
  const id = form.get('id') as string;

  if (!filepath)
    return new NextResponse('No se subió ningún archivo', { status: 400 });

  const formData = new FormData();
  formData.append('image', filepath, filepath.name);

  const { error } = await fetchClient.PATCH('/profile/update-image/{id}', {
    params: {
      path: {
        id,
      },
    },
    // @ts-ignore
    body: formData,
  });

  if (error) {
    return new NextResponse('Error al subir la imagen', { status: 500 });
  }

  return new NextResponse('Imágen subida con éxito', { status: 200 });
}

export async function DELETE(req: NextRequest, res: NextResponse) {
  const form = await req.formData();
  const id = form.get('id') as string;
  const { response } = await fetchClient.DELETE('/profile/delete-image/{id}', {
    params: {
      path: {
        id,
      },
    },
  });

  if (response.ok) {
    return new NextResponse('Archivo eliminado con éxito', { status: 200 });
  }

  return new NextResponse('No se mandó ningún archivo', { status: 400 });
}
