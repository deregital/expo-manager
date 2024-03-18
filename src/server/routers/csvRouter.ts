import { protectedProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { PrismaClient } from '@prisma/client';
import * as fastCsv from 'fast-csv';

const prisma = new PrismaClient();

async function exportToCSV() {
  try {
    const modelos = await prisma.perfil.findMany();

    const csvStream = fastCsv.format({ headers: true });
    let csvData = '';

    csvStream.on('data', (chunk: any) => {
      csvData += chunk;
    });

    modelos.forEach((row: any) => {
      csvStream.write(row);
    });

    csvStream.end();

    await new Promise<void>((resolve) => {
      csvStream.on('end', () => {
        resolve();
      });
    });

    return csvData;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  } finally {
    await prisma.$disconnect(); 
  }
}

export const csvRouter = router({
  downloadModelos: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No tienes permisos para realizar esta acción",
      });
    }

   
    return exportToCSV();
  }),
});

export { exportToCSV };

