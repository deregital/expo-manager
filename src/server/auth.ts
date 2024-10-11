import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/server/db';
import { fetchClient } from '@/server/fetchClient';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth/jwt' {
  // eslint-disable-next-line no-unused-vars
  interface JWT {
    user: {
      id: string;
      username: string;
      esAdmin: boolean;
    };
    backendTokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  }
}

declare module 'next-auth' {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    expires: DefaultSession['expires'];
    user?: {
      id: string;
      username: string;
      esAdmin: boolean;
    } & DefaultSession['user'];
  }
}

export async function refreshToken(token: JWT): Promise<JWT> {
  const { data, response } = await fetchClient.POST('/auth/refresh', {
    headers: {
      authorization: `Refresh ${token.backendTokens.refreshToken}`,
    },
  });

  if (response.status !== 201 || !data) {
    throw new Error('Error al refrescar el token');
  }

  return {
    ...token,
    backendTokens: data!,
  };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    session: ({ session, token }) => {
      fetchClient.use({
        onRequest: ({ request }) => {
          request.headers.set(
            'Authorization',
            `Bearer ${token.backendTokens.accessToken}`
          );
          return request;
        },
      });
      return {
        ...session,
        backendTokens: {
          ...token.backendTokens,
        },
        user: {
          ...session.user,
          id: token.sub,
          username: token.username,
          esAdmin: token.esAdmin,
        },
      };
    },

    async jwt({ user, token }) {
      if (user) {
        return { ...user, ...token };
      }
      if (new Date().getTime() < token.backendTokens.expiresIn) {
        return token;
      }

      return await refreshToken(token);
    },
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Nombre de usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      id: 'credentials',
      type: 'credentials',
      async authorize(credentials, _req) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const { response, data, error } = await fetchClient.POST(
          '/auth/login',
          {
            body: credentials,
          }
        );

        if ((response.status !== 201 || !data?.user) && error) {
          const message = error.message[0] || 'Error desconocido';

          throw new Error(message);
        }

        return {
          id: data.user.id!,
          username: data.user.username!,
          esAdmin: data.user.role === 'ADMIN',
          backendTokens: data.backendTokens,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
};

export const getServerAuthSession = () => getServerSession(authOptions);
