import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/server/db';

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
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
        username: token.username,
        esAdmin: token.esAdmin,
      },
    }),

    jwt({ user, token }) {
      if (user) {
        token.id = user.id;

        if ('username' in user) token.username = user.username;
        if ('esAdmin' in user) token.esAdmin = user.esAdmin;
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

        const user = await prisma?.cuenta.findFirst({
          where: {
            nombreUsuario: credentials.username,
            contrasena: credentials.password,
          },
        });

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          username: user.nombreUsuario,
          esAdmin: user.esAdmin,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
};

export const getServerAuthSession = () => getServerSession(authOptions);
