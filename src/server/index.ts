import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { perfilRouter } from '@/server/routers/perfilRouter';
import { modeloRouter } from '@/server/routers/modelosRouter';
import { etiquetaRouter } from '@/server/routers/etiquetaRouter';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const appRouter = router({
  perfil: perfilRouter,
  modelo: modeloRouter,
  etiqueta: etiquetaRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
