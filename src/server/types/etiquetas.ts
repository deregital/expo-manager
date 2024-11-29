import { Prisma } from '@prisma/client';

export type EtiquetaBaseConGrupoColor = Prisma.EtiquetaGetPayload<{
  select: {
    id: true;
    nombre: true;
    tipo: true;
    grupo: { select: { color: true; id: true; esExclusivo: true } };
  };
}>;
