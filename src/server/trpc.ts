import { getServerAuthSession, refreshToken } from '@/server/auth';
import { prisma } from '@/server/db';
import { fetchClient } from '@/server/fetchClient';
import { TRPCError, initTRPC } from '@trpc/server';
import { JWT } from 'next-auth/jwt';
import { ZodError } from 'zod';

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
  const session = ctx.session as unknown as JWT | undefined | null;
  if (!session || !session.user || !session.backendTokens) {
    console.log('No session');
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const backendTokens = session.backendTokens;

  let { data: user } = await fetchClient.GET('/account/me', {
    headers: {
      Authorization: `Bearer ${backendTokens.accessToken}`,
    },
  });

  if (!user) {
    const refreshed = await refreshToken(session);

    const { data: userRefreshed } = await fetchClient.GET('/account/me', {
      headers: {
        Authorization: `Bearer ${refreshed.backendTokens.accessToken}`,
      },
    });

    if (!userRefreshed) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    user = userRefreshed;
  }

  const { tags: etiquetasNoAdmin } = user;

  const etiquetasTotales = await ctx.prisma.etiqueta.findMany({
    select: {
      id: true,
    },
  });

  const etiquetasVisibles =
    user.role === 'ADMIN'
      ? etiquetasTotales.map((e) => e.id)
      : etiquetasNoAdmin.map((e) => e.id);

  const filtroBase =
    user.globalFilter.length > 0 && user.isGlobalFilterActive
      ? user.globalFilter.map((e) => e.id)
      : [];

  // const newPrisma = ctx.prisma.$extends({
  //   query: {
  //     perfil: {
  //       async findMany({ args, query }) {
  //         const andArray = Array.isArray(args.where?.AND)
  //           ? args.where.AND
  //           : args.where?.AND
  //             ? [args.where.AND]
  //             : [];
  //         args.where = {
  //           ...args.where,
  //           AND: [
  //             ...andArray,
  //             ...filtroBase.map((eId) => ({
  //               etiquetas: {
  //                 some: {
  //                   id: eId,
  //                 },
  //               },
  //             })),
  //           ],
  //         };

  //         return query(args);
  //       },
  //       async findUnique({ args, query }) {
  //         const andArray = Array.isArray(args.where?.AND)
  //           ? args.where.AND
  //           : args.where?.AND
  //             ? [args.where.AND]
  //             : [];
  //         args.where = {
  //           ...args.where,
  //           AND: [
  //             ...andArray,
  //             ...filtroBase.map((eId) => ({
  //               etiquetas: {
  //                 some: {
  //                   id: eId,
  //                 },
  //               },
  //             })),
  //           ],
  //         };
  //         return query(args);
  //       },
  //     },
  //   },
  // });

  return next({
    ctx: {
      ...ctx,
      fetch: fetchClient,
      prisma,
      etiquetasVisibles,
      filtroBase,
    },
  });
});
