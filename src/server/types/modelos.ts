import { Perfil } from '@prisma/client';

export type ModelosSimilarity = {
  similarityTelefono: number;
  similarityNombre: number;
  modelo: Pick<Perfil, 'nombreCompleto' | 'id'>;
}[];
