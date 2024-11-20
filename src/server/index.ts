import { router } from './trpc';
import { profileRouter } from '@/server/routers/profileRouter';
import { tagRouter } from '@/server/routers/tagRouter';
import { whatsappRouter } from '@/server/routers/whatsappRouter';
import { tagGroupRouter } from '@/server/routers/tagGroupRouter';
import { type inferRouterOutputs } from '@trpc/server';
import { csvRouter } from '@/server/routers/csvRouter';
import { eventRouter } from '@/server/routers/eventRouter';
import { accountRouter } from '@/server/routers/cuentaRouter';
import { notificacionRouter } from '@/server/routers/notificacionRouter';
import { locationRouter } from '@/server/routers/locationRouter';
import { eventFolderRouter } from '@/server/routers/event-folderRouter';
import { cannedResponseRouter } from '@/server/routers/canned-responseRouter';
import { commentRouter } from '@/server/routers/commentRouter';

export const appRouter = router({
  profile: profileRouter,
  tag: tagRouter,
  whatsapp: whatsappRouter,
  tagGroup: tagGroupRouter,
  csv: csvRouter,
  event: eventRouter,
  eventFolder: eventFolderRouter,
  account: accountRouter,
  notificacion: notificacionRouter,
  location: locationRouter,
  cannedResponse: cannedResponseRouter,
  comment: commentRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
