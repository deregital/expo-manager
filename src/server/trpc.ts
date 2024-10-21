import { getServerAuthSession } from '@/server/auth';
import { prisma } from '@/server/db';
import { fetchClient } from '@/server/fetchClient';
import { TRPCError, initTRPC } from '@trpc/server';
import { JWT } from 'next-auth/jwt';
import { ZodError } from 'zod';

export function handleError(error: {
  message: string[];
  statusCode: number;
  error: string;
}): TRPCError | undefined {
  const { message, statusCode, error: cause } = error;
  const messageString = message[0];
  const errorCode = statusCode as
    | 200
    | 400
    | 401
    | 403
    | 404
    | 408
    | 409
    | 412
    | 413
    | 405
    | 499
    | 500;

  if (errorCode === 200) {
    return;
  }

  const errorFromStatusCode = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    408: 'TIMEOUT',
    409: 'CONFLICT',
    412: 'PRECONDITION_FAILED',
    413: 'PAYLOAD_TOO_LARGE',
    405: 'METHOD_NOT_SUPPORTED',
    499: 'CLIENT_CLOSED_REQUEST',
    500: 'INTERNAL_SERVER_ERROR',
  } as const;

  const code =
    errorFromStatusCode[errorCode] || ('INTERNAL_SERVER_ERROR' as const);

  return new TRPCError({
    code,
    message: messageString,
    cause,
  });
}

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
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  // const backendTokens = session.backendTokens;

  // let { data: user } = await fetchClient.GET('/account/me', {
  //   headers: {
  //     Authorization: `Bearer ${backendTokens.accessToken}`,
  //   },
  // });
  // if (!user) {
  //   const refreshed = await refreshToken(session);

  //   console.log('Refreshing token', refreshed.backendTokens.expiresIn);

  //   const { data: userRefreshed } = await fetchClient.GET('/account/me', {
  //     headers: {
  //       Authorization: `Bearer ${refreshed.backendTokens.accessToken}`,
  //     },
  //   });

  //   if (!userRefreshed) {
  //     throw new TRPCError({ code: 'UNAUTHORIZED' });
  //   }
  //   user = userRefreshed;
  // }

  // const { tags: etiquetasNoAdmin } = user;

  // const etiquetasTotales = await ctx.prisma.etiqueta.findMany({
  //   select: {
  //     id: true,
  //   },
  // });

  // const etiquetasVisibles =
  //   user.role === 'ADMIN'
  //     ? etiquetasTotales.map((e) => e.id)
  //     : etiquetasNoAdmin.map((e) => e.id);

  // const filtroBase =
  //   user.globalFilter.length > 0 && user.isGlobalFilterActive
  //     ? user.globalFilter.map((e) => e.id)
  //     : [];

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
      etiquetasVisibles: [],
      filtroBase: [],
    },
  });
});
