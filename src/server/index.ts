import { router } from './trpc';
import { modeloRouter } from '@/server/routers/modelosRouter';
import { etiquetaRouter } from '@/server/routers/etiquetaRouter';
import { whatsappRouter } from '@/server/routers/whatsappRouter';
import { grupoEtiquetaRouter } from '@/server/routers/grupoEtiquetaRouter';
import { comentarioRouter } from '@/server/routers/comentarioRouter';
import { inferRouterOutputs } from '@trpc/server';
import { csvRouter } from '@/server/routers/csvRouter';
import { eventoRouter } from '@/server/routers/eventoRouter';
import { cuentaRouter } from '@/server/routers/cuentaRouter';
import { notificacionRouter } from '@/server/routers/notificacionRouter';
import { mapaRouter } from '@/server/routers/mapaRouter';

export const appRouter = router({
  modelo: modeloRouter,
  etiqueta: etiquetaRouter,
  whatsapp: whatsappRouter,
  grupoEtiqueta: grupoEtiquetaRouter,
  comentario: comentarioRouter,
  csv: csvRouter,
  evento: eventoRouter,
  cuenta: cuentaRouter,
  notificacion: notificacionRouter,
  mapa: mapaRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
