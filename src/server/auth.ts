import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user'];
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
      },
    }),
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
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
        };
      },
    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions);
