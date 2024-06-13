import { Perfil } from '@prisma/client';

export type ModelosSimilarity = {
  similarityTelefono: number;
  similarityNombre: number;
  modelo: Perfil;
}[];
