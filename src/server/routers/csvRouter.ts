import { protectedProcedure, router } from '@/server/trpc';
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import * as fastCsv from 'fast-csv';

export const csvRouter = router({
  downloadModelos: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'No tienes permisos para realizar esta acción',
      });
    }

    try {
      const modelos = await ctx.prisma.perfil.findMany();

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
    }
  }),
  downloadDatabase: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'No tienes permisos para realizar esta acción',
      });
    }
    let dataTables = [];
    try {
      for (const table in ctx.prisma) {
        if (table.charAt(0) === '_' || table.charAt(0) === '$') {
          continue;
        }
        dataTables.push(await (ctx.prisma as any)[table].findMany());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
    return dataTables;
    //   const csvStream = fastCsv.format({ headers: true });
    //   let csvData = '';

    //   csvStream.on('data', (chunk: any) => {
    //     csvData += chunk;
    //   });

    //   data.forEach((row: any) => {
    //     csvStream.write(row);
    //   });

    //   csvStream.end();

    //   await new Promise<void>((resolve) => {
    //     csvStream.on('end', () => {
    //       resolve();
    //     });
    //   });

    //   return csvData;
    // } catch (error) {
    //   console.error('Error exporting to CSV:', error);
    //   throw error;
    // }
  }),
});
