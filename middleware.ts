import { auth } from '@/lib/auth';

// The auth() middleware handles authorization via the authorized callback in auth.ts
export const middleware = auth(() => {});

export const config = {
  matcher: ['/app/:path*'],
};
