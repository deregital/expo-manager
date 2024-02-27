import { router } from './trpc';
import { perfilRouter } from '@/server/routers/perfilRouter';
import { modeloRouter } from '@/server/routers/modelosRouter';
import { etiquetaRouter } from '@/server/routers/etiquetaRouter';
import { whatsappRouter } from '@/server/routers/whatsappRouter';
import { grupoEtiquetaRouter } from '@/server/routers/grupoEtiquetaRouter';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const appRouter = router({
  perfil: perfilRouter,
  modelo: modeloRouter,
  etiqueta: etiquetaRouter,
  whatsapp: whatsappRouter,
  grupoEtiqueta: grupoEtiquetaRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
