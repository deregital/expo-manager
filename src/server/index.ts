import { router } from './trpc';
import { modeloRouter } from '@/server/routers/modelosRouter';
import { etiquetaRouter } from '@/server/routers/etiquetaRouter';
import { whatsappRouter } from '@/server/routers/whatsappRouter';
import { grupoEtiquetaRouter } from '@/server/routers/grupoEtiquetaRouter';
import { inferRouterOutputs } from '@trpc/server';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const appRouter = router({
  modelo: modeloRouter,
  etiqueta: etiquetaRouter,
  whatsapp: whatsappRouter,
  grupoEtiqueta: grupoEtiquetaRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
