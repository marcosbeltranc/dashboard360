import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('auth_token');
    const { pathname } = request.nextUrl;

    if (pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)) {
        return NextResponse.next();
    }

    if (!token && pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && (pathname === '/login' || pathname === '/')) {
        return NextResponse.redirect(new URL('/home', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Coincide con todo excepto:
         * 1. api (rutas de backend)
         * 2. _next/static (archivos de compilación)
         * 3. _next/image (optimización de imágenes)
         * 4. favicon.ico y archivos con extensiones (svg, png, jpg, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$ ocean).*)',
    ],
};