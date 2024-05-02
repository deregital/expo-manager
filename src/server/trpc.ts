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

  const user = await ctx.prisma.cuenta.findUnique({
    where: {
      id: ctx.session.user.id,
    },
    select: {
      esAdmin: true,
    },
  });

  const etiquetasTotales = await ctx.prisma.etiqueta.findMany({
    select: {
      id: true,
    },
  });

  const etiquetasNoAdmin = await ctx.prisma.cuenta.findUnique({
    where: {
      id: ctx.session.user.id,
    },
    select: {
      etiquetas: true,
    },
  });

  const etiquetasVisibles = user?.esAdmin
    ? etiquetasTotales.map((e) => e.id)
    : etiquetasNoAdmin
      ? etiquetasNoAdmin.etiquetas.map((e) => e.id)
      : [];

  ctx.prisma.$disconnect();

  return next({
    ctx: {
      ...ctx,
      etiquetasVisibles,
    },
  });
});
