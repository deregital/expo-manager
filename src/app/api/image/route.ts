import * as https from 'https';
import { type NextRequest, NextResponse } from 'next/server';
import { Duplex } from 'stream';
import { prisma } from '@/server/db';

function bufferToStream(myBuffer: Buffer) {
  let tmp = new Duplex();
  tmp.push(myBuffer);
  tmp.push(null);
  return tmp;
}

const extensions = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function POST(req: NextRequest, res: NextResponse) {
  const form = await req.formData();
  const filepath = form.get('imagen') as File;
  const id = form.get('id') as string;
  const currentFotoUrl = form.get('url') as string;
  if (currentFotoUrl !== '') {
    const options = {
      hostname: process.env.BUNNY_HOSTNAME,
      path: `/${process.env.BUNNY_STORAGE_ZONE_NAME}${new URL(currentFotoUrl).pathname}`,
      method: 'DELETE',
      headers: {
        AccessKey: process.env.BUNNY_ACCESS_KEY_CRUD,
      },
    };
    const reqCDN = https.request(options, (response) => {
      // eslint-disable-next-line no-unused-vars
      let responseBody = '';
      response.on('data', (chunk) => {
        responseBody += chunk;
      });
      response.on('end', async () => {
        if (response.statusCode !== 200 && response.statusCode !== 201) {
          return new Response('Error al eliminar el archivo', { status: 500 });
        } else {
        }
      });
    });
    reqCDN.on('error', (error) => {
      console.error('Error al eliminar el archivo:', error);
      return new Response('Error al eliminar el archivo', { status: 500 });
    });
    reqCDN.end();
  }
  if (!filepath)
    return new NextResponse('No se subió ningún archivo', { status: 400 });
  const fileBuffer = await filepath.arrayBuffer();
  const path = `/${process.env.BUNNY_STORAGE_ZONE_NAME}/${id}.${extensions[filepath.type as keyof typeof extensions]}`;
  const fotoUrl = `https://${process.env.BUNNY_CDN}/${id}.${extensions[filepath.type as keyof typeof extensions]}`;
  const options = {
    hostname: process.env.BUNNY_HOSTNAME,
    path: path,
    method: 'PUT',
    headers: {
      AccessKey: process.env.BUNNY_ACCESS_KEY_CRUD,
      'Content-Type': 'application/octet-stream',
    },
  };

  const reqCDN = https.request(options, (response) => {
    // eslint-disable-next-line no-unused-vars
    let responseBody = '';
    response.on('data', (chunk) => {
      responseBody += chunk;
    });
    response.on('end', async () => {
      if (response.statusCode !== 200 && response.statusCode !== 201) {
        return new NextResponse('Error al subir el archivo', { status: 500 });
      }
      const options = {
        method: 'POST',
        headers: {
          AccessKey: process.env.BUNNY_ACCESS_KEY_PURGE!,
        },
      };
      const resPurge = await fetch(
        'https://api.bunny.net/purge?' +
          new URLSearchParams({ url: fotoUrl, async: 'false' }),
        options
      );
      if (!resPurge.ok) {
        return new NextResponse('Error al purgar el archivo', { status: 500 });
      }
      await prisma?.perfil.update({
        where: {
          id: id,
        },
        data: {
          fotoUrl: fotoUrl,
        },
      });
    });
  });

  reqCDN.on('error', (error) => {
    return new NextResponse('Error al subir el archivo', { status: 500 });
  });

  const stream = bufferToStream(Buffer.from(fileBuffer));
  stream.pipe(reqCDN);

  return new NextResponse('Imágen subida con éxito', { status: 200 });
}

export async function DELETE(req: NextRequest, res: NextResponse) {
  const form = await req.formData();
  const currentFotoUrl = form.get('url') as string;

  if (currentFotoUrl !== '') {
    const options = {
      hostname: process.env.BUNNY_HOSTNAME,
      path: `/${process.env.BUNNY_STORAGE_ZONE_NAME}${new URL(currentFotoUrl).pathname}`,
      method: 'DELETE',
      headers: {
        AccessKey: process.env.BUNNY_ACCESS_KEY_CRUD,
      },
    };
    const reqCDN = https.request(options, (response) => {
      // eslint-disable-next-line no-unused-vars
      let responseBody = '';
      response.on('data', (chunk) => {
        responseBody += chunk;
      });
      response.on('end', async () => {
        if (response.statusCode !== 200 && response.statusCode !== 201) {
          return new NextResponse('Error al eliminar el archivo', {
            status: 500,
          });
        } else {
          await prisma?.perfil.update({
            where: {
              id: form.get('id') as string,
            },
            data: {
              fotoUrl: null,
            },
          });
          // .then(() => {
          //   return new NextResponse('Archivo eliminado con éxito', {
          //     status: 200,
          //   });
          // });
          return new NextResponse('Archivo eliminado con éxito', {
            status: 200,
          });
        }
      });
    });
    reqCDN.on('error', (error) => {
      console.error('Error al eliminar el archivo:', error);
      return new NextResponse('Error al eliminar el archivo', { status: 500 });
    });
    reqCDN.end();
    return new NextResponse('Archivo eliminado con éxito', { status: 200 });
  }
  return new NextResponse('No se mandó ningún archivo', { status: 400 });
}
