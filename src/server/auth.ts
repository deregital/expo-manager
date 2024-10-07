import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/server/db';
import { fetchClient } from '@/server/fetchClient';
import { Role } from 'expo-backend-types';

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

    jwt({ user, token }) {
      if (user) {
        return { ...user, ...token };
      }
      return token;
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

        const { response, data } = await fetchClient.POST('/auth/login', {
          body: credentials,
        });

        if (response.status === 401 || !data || !data.user) {
          return null;
        }

        return {
          id: data.user.id!,
          username: data.user.username!,
          esAdmin: data.user.role === Role.ADMIN,
          backendTokens: data.backendTokens,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
};

export const getServerAuthSession = () => getServerSession(authOptions);
