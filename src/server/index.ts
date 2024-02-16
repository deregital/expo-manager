import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { perfilRouter } from '@/server/routers/perfilRouter';
import { modelosRouter } from './routers/modelosRouter';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const appRouter = router({
  perfil: perfilRouter,
  modelos: modelosRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
