import * as https from 'https';
import { NextRequest, NextResponse } from 'next/server';
import { Duplex } from 'stream';

export const config = {
  api: {
    bodyParser: false, // Deshabilitar bodyParser por defecto
  },
};

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
      hostname: process.env.HOSTNAME,
      path: `/${process.env.STORAGE_ZONE_NAME}${new URL(currentFotoUrl).pathname}`,
      method: 'DELETE',
      headers: {
        AccessKey: process.env.ACCESS_KEY2,
      },
    };
    const reqCDN = https.request(options, (response) => {
      let responseBody = '';
      response.on('data', (chunk) => {
        responseBody += chunk;
      });
      response.on('end', async () => {
        if (response.statusCode !== 200 && response.statusCode !== 201) {
          console.error('Error al eliminar el archivo:', responseBody);
          return new Response('Error al eliminar el archivo', { status: 500 });
        } else {
          console.log('Archivo eliminado con éxito', responseBody);
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
  const path = `/${process.env.STORAGE_ZONE_NAME}/${id}.${extensions[filepath.type as keyof typeof extensions]}`;
  const fotoUrl = `https://${process.env.CDN}/${id}.${extensions[filepath.type as keyof typeof extensions]}`;
  const options = {
    hostname: process.env.HOSTNAME,
    path: path,
    method: 'PUT',
    headers: {
      AccessKey: process.env.ACCESS_KEY2,
      'Content-Type': 'application/octet-stream',
    },
  };

  const reqCDN = https.request(options, (response) => {
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
          AccessKey: process.env.ACCESS_KEY!,
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
      hostname: process.env.HOSTNAME,
      path: `/${process.env.STORAGE_ZONE_NAME}${new URL(currentFotoUrl).pathname}`,
      method: 'DELETE',
      headers: {
        AccessKey: process.env.ACCESS_KEY2,
      },
    };
    const reqCDN = https.request(options, (response) => {
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
          await prisma?.perfil
            .update({
              where: {
                id: form.get('id') as string,
              },
              data: {
                fotoUrl: null,
              },
            })
            .then(() => {
              return new NextResponse('Archivo eliminado con éxito', {
                status: 200,
              });
            });
        }
      });
    });
    reqCDN.on('error', (error) => {
      console.error('Error al eliminar el archivo:', error);
      return new NextResponse('Error al eliminar el archivo', { status: 500 });
    });
    reqCDN.end();
  }
}
