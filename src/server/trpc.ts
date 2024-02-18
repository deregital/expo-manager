import { TRPCError, initTRPC } from '@trpc/server';
import { ZodError } from 'zod';
import { getServerAuthSession } from '@/server/auth';
import { prisma } from '@/server/db';

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getServerAuthSession();

  return {
    session,
    prisma,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const etiquetas = await ctx.prisma.cuenta.findUnique({
    where: {
      id: ctx.session.user.id,
    },
    select: {
      etiquetas: true,
    },
  });

  const etiquetasVisibles = etiquetas
    ? etiquetas.etiquetas.map((e) => e.id)
    : [];

  return next({
    ctx: {
      ...ctx,
      etiquetasVisibles,
    },
  });
});
