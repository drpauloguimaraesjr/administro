import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Permite acesso a login sem autenticação
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  // Portal do paciente tem seu próprio auth - não redireciona para /login do admin
  if (request.nextUrl.pathname.startsWith('/portal')) {
    return NextResponse.next();
  }

  // Para outras rotas, a autenticação será verificada no AuthProvider
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

