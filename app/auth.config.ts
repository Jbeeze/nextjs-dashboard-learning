import type { NextAuthConfig } from 'next-auth';
import { NextURL } from 'next/dist/server/web/next-url';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDasbhoard = nextUrl.pathname.startsWith('/dashboard');

            if (isOnDasbhoard) {
                if (isLoggedIn) return true;
                return false; // Redirect to unauthenticated users to login page
            } else if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
    },
    providers: [], // providers is an array where you list different login options such as Google or GitHub. 
} satisfies NextAuthConfig;

///You can use the pages option to specify the route for custom sign-in, sign-out, and error pages. 
// This is not required, but by adding signIn: '/login' into our pages option, the user will be redirected 
// to our custom login page, rather than the NextAuth.js default page.