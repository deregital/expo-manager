import { protectedProcedure, router } from '@/server/trpc';
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
});
