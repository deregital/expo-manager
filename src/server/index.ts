import { router } from './trpc';
import { modeloRouter } from '@/server/routers/modelosRouter';
import { tagRouter } from '@/server/routers/tagRouter';
import { whatsappRouter } from '@/server/routers/whatsappRouter';
import { tagGroupRouter } from '@/server/routers/tagGroupRouter';
import { inferRouterOutputs } from '@trpc/server';
import { csvRouter } from '@/server/routers/csvRouter';
import { eventoRouter } from '@/server/routers/eventoRouter';
import { cuentaRouter } from '@/server/routers/cuentaRouter';
import { notificacionRouter } from '@/server/routers/notificacionRouter';
import { locationRouter } from '@/server/routers/locationRouter';
import { carpetaEventosRouter } from '@/server/routers/carpetaEventosRouter';
import { cannedResponseRouter } from '@/server/routers/canned-responseRouter';
import { commentRouter } from '@/server/routers/commentRouter';

export const appRouter = router({
  modelo: modeloRouter,
  tag: tagRouter,
  whatsapp: whatsappRouter,
  tagGroup: tagGroupRouter,
  csv: csvRouter,
  evento: eventoRouter,
  carpetaEventos: carpetaEventosRouter,
  cuenta: cuentaRouter,
  notificacion: notificacionRouter,
  location: locationRouter,
  cannedResponse: cannedResponseRouter
  comment: commentRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
