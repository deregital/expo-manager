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
      etiquetas: true,
      filtroBase: true,
      filtroBaseActivo: true,
    },
  });

  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const { esAdmin, etiquetas: etiquetasNoAdmin } = user;

  const etiquetasTotales = await ctx.prisma.etiqueta.findMany({
    select: {
      id: true,
    },
  });

  const etiquetasVisibles = esAdmin
    ? etiquetasTotales.map((e) => e.id)
    : etiquetasNoAdmin.map((e) => e.id);

  const filtroBase =
    user.filtroBase.length > 0 && user.filtroBaseActivo
      ? user.filtroBase.map((e) => e.id)
      : [];

  const newPrisma = ctx.prisma.$extends({
    query: {
      perfil: {
        async findMany({ args, query }) {
          const andArray = Array.isArray(args.where?.AND)
            ? args.where.AND
            : args.where?.AND
              ? [args.where.AND]
              : [];
          args.where = {
            ...args.where,
            AND: [
              ...andArray,
              ...filtroBase.map((eId) => ({
                etiquetas: {
                  some: {
                    id: eId,
                  },
                },
              })),
            ],
          };
          return query(args);
        },
        async findUnique({ args, query }) {
          const andArray = Array.isArray(args.where?.AND)
            ? args.where.AND
            : args.where?.AND
              ? [args.where.AND]
              : [];
          args.where = {
            ...args.where,
            AND: [
              ...andArray,
              ...filtroBase.map((eId) => ({
                etiquetas: {
                  some: {
                    id: eId,
                  },
                },
              })),
            ],
          };
          return query(args);
        },
      },
    },
  });

  return next({
    ctx: {
      ...ctx,
      prisma: newPrisma,
      etiquetasVisibles,
      filtroBase,
    },
  });
});
