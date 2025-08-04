import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get('__session')?.value;
    const { pathname } = request.nextUrl;

    // These paths don't require authentication
    const publicPaths = ['/login', '/signup'];
    if (publicPaths.some(p => pathname.startsWith(p))) {
        return NextResponse.next();
    }
    
    // API routes used for auth don't need protection by the middleware
    if (pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    if (!sessionCookie) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // We need to verify the session cookie by calling an internal API route
    // because the middleware runs on the edge and firebase-admin is not compatible.
    const response = await fetch(new URL('/api/auth/session', request.url), {
        headers: {
            'Cookie': `__session=${sessionCookie}`
        }
    });

    // If the session is not valid, redirect to login
    if (response.status !== 200) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Rota para a qual o middleware será aplicado
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
