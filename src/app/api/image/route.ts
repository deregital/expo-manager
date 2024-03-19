import * as https from 'https';
import * as fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const filepath = req.body!.file.path;
  const filename = `${req.body.file.originalname}`;
  const options = {
    hostname: process.env.HOSTNAME,
    path: `/${process.env.STORAGE_ZONE_NAME}/${filename}`,
    method: 'PUT',
    headers: {
      AccessKey: process.env.ACCESS_KEY,
      'Content-Type': 'application/octet-stream',
    },
  };

  const reqCDN = https.request(options, (response) => {
    let responseBody = '';
    response.on('data', (chunk) => {
      responseBody += chunk;
    });

    response.on('end', () => {
      fs.unlinkSync(filepath); // Eliminar el archivo temporal
      res.json({ message: 'Archivo subido con éxito', filename: filename });
    });
  });

  reqCDN.on('error', (error) => {
    console.error('Error al subir el archivo:', error);
    res.status(500).json({ error: 'Error al subir el archivo' });
  });

  const stream = fs.createReadStream(filepath);
  stream.pipe(reqCDN);
  return new Response('Imágen recibida', { status: 200 });
}

// import { createRouter } from 'next-connect';
// import multer from 'multer';
// import https from 'https';
// import fs from 'fs';
// import { v4 as uuidv4 } from 'uuid';
// import { NextApiRequest, NextApiResponse } from 'next';

// const upload = multer({ dest: '/tmp' }); // Almacenar archivos temporalmente en /tmp

// const apiRoute = createRouter();

// Solo permitir POST requests
// apiRoute.use(upload.single('imagen'));

// apiRoute.post((req: NextApiRequest, res: NextApiResponse) => {
//     if (!req.body.file) return res.status(400).send('No se subió ningún archivo.');
//     const filename = `${uuidv4()}-${req.body.file.originalname}`;

//     const filePath = req.body.file.path;
//     const BUNNY_STORAGE_ZONE_NAME = 'expo-manager';
//     const BUNNY_ACCESS_KEY = 'e6caddd5-3111-4df0-83b4758acf04-66b9-44b3';
//     const BUNNY_HOSTNAME = 'br.storage.bunnycdn.com';

//     const options = {
//         hostname: BUNNY_HOSTNAME,
//         path: `/${BUNNY_STORAGE_ZONE_NAME}/${filename}`,
//         method: 'PUT',
//         headers: {
//             AccessKey: BUNNY_ACCESS_KEY,
//             'Content-Type': 'application/octet-stream',
//         },
//     };

//     const reqCDN = https.request(options, response => {
//         let responseBody = '';
//         response.on('data', chunk => {
//             responseBody += chunk;
//         });

//         response.on('end', () => {
//             fs.unlinkSync(filePath); // Eliminar el archivo temporal
//             res.json({ message: 'Archivo subido con éxito', filename: filename });
//         });
//     });

//     reqCDN.on('error', error => {
//         console.error('Error al subir el archivo:', error);
//         res.status(500).json({ error: 'Error al subir el archivo' });
//     });

//     const stream = fs.createReadStream(filePath);
//     stream.pipe(reqCDN);
// });

// export const config = {
//     api: {
//         bodyParser: false, // Deshabilitar bodyParser por defecto
//     },
// };

// export default apiRoute.handler();
