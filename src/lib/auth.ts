import NextAuth, { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    // Development credentials provider
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Only allow in development
        if (process.env.NODE_ENV !== 'development') {
          return null;
        }

        // Test admin credentials
        if (
          credentials?.email === 'admin@creatortos.dev' &&
          credentials?.password === 'dev123456'
        ) {
          return {
            id: 'dev-admin-001',
            name: 'Development Admin',
            email: 'admin@creatortos.dev',
            image: null,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      const isOnApp = pathname.startsWith('/app');

      if (isOnApp) {
        if (isLoggedIn) return true;
        // Redirect to login, preserving the intended destination
        const loginUrl = new URL('/login', request.nextUrl.origin);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return Response.redirect(loginUrl);
      }

      // If already logged in and hitting /login, send to dashboard
      if (pathname === '/login' && isLoggedIn) {
        return Response.redirect(new URL('/app/dashboard', request.nextUrl.origin));
      }

      return true;
    },
  },
};

const { auth, handlers, signIn, signOut } = NextAuth(authConfig);

export { auth, handlers, signIn, signOut };
export const getServerSession = auth;
