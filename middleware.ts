import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
    return;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public API routes
        if (req.nextUrl.pathname.startsWith('/api/auth/')) {
          return true;
        }
        
        // Protect API routes that require authentication
        if (req.nextUrl.pathname.startsWith('/api/')) {
          return !!token;
        }
        
        // For page routes, we handle auth in the component level
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Protect API routes except auth
    '/api/((?!auth).*)',
  ],
};