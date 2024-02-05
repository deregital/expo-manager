import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from './trpc';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const appRouter = router({
  hello: publicProcedure
    .input(
      z
        .object({
          text: z.string(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      await sleep(1000);
      return {
        greeting: `Hello, ${input?.text ?? 'World'}!`,
      };
    }),
  protectedHello: protectedProcedure.query(async () => {
    await sleep(1000);

    return {
      greeting: 'Hello, World!',
    };
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
