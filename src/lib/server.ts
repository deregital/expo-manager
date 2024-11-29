import { PrismaClient } from '@prisma/client';

export async function getHighestIdLegible(prisma: PrismaClient) {
  const perfilMayorIdLegible = await prisma.perfil.findFirst({
    orderBy: {
      idLegible: 'desc',
    },
  });
  const idLegible = perfilMayorIdLegible?.idLegible ?? 0;
  return idLegible;
}
