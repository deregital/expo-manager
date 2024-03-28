import { protectedProcedure, router } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import * as fastCsv from 'fast-csv';
import JSZip from 'jszip';
import ExcelJS from 'exceljs';

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
  downloadAllTables: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'No tienes permisos para realizar esta acción',
      });
    }
    const today = new Date().toISOString();
    console.log(today);
    try {
      let dataTables = [];
      for (const table in ctx.prisma) {
        if (table.charAt(0) === '_' || table.charAt(0) === '$') {
          continue;
        }
        if (table === 'perfil' || table === 'cuenta') {
          dataTables.push(await (ctx.prisma as any)[table].findMany({
            include: {
              etiquetas: true,
              comentarios: true,
            }
          }));
          dataTables.push(table)
        }
        else {
          dataTables.push(await (ctx.prisma as any)[table].findMany());
          dataTables.push(table)
        }
      } // Lista de todas tus tablas en la base de datos
      const zip = new JSZip();
      const workbook = new ExcelJS.Workbook();
      for (let i = 0; i < dataTables.length; i+=2) {
        let csvData = '';
        const worksheet = workbook.addWorksheet(dataTables[i + 1]);

        const csvStream = fastCsv.format({ headers: true });

        csvStream.on('data', (chunk: any) => {
          csvData += chunk;
        });
        worksheet.addRow(dataTables[i][0] ? Object.keys(dataTables[i][0]) : undefined);
        dataTables[i].forEach((row: any) => {
          row.etiquetas = row.etiquetas ? row.etiquetas.map((etiqueta: any) => etiqueta.id).join('+') : row = { ...row, etiquetas: null};
          row.comentarios = row.comentarios ? row.comentarios.map((comentario: any) => comentario.id).join('+') : row = { ...row, comentarios: null};
          csvStream.write(row);
          worksheet.addRow(Object.values(row));
        });

        csvStream.end();

        await new Promise<void>((resolve) => {
          csvStream.on('end', () => {
            resolve();
          });
        });
    
        zip.file(`${today}-${dataTables[i + 1]}.csv`, csvData);        
      }
      const excelBuffer = await workbook.xlsx.writeBuffer();
      zip.file(`${today}-Database.xlsx`, excelBuffer);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipData = await zipBlob.arrayBuffer();
  
      return Buffer.from(zipData);
    } catch (error) {
      console.error('Error exporting to ZIP:', error);
      throw error;
    }
  }),
});
