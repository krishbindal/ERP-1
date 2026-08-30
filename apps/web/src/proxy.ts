import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  console.log("PROXY CALLED:", request.nextUrl.pathname);
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  const isLoginRoute = request.nextUrl.pathname.startsWith('/login');
  const isAuthUpdateRoute = request.nextUrl.pathname.startsWith('/auth/update-password');
  const isAuthActionRoute = request.nextUrl.pathname.startsWith('/auth');

  console.log("PROXY CHECK USER:", { user: !!user, error, path: request.nextUrl.pathname, cookies: request.cookies.getAll().map(c => c.name) });

  if (!user && !isLoginRoute && !isAuthActionRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // If logged in, check if password reset is required
    const { data: requiresReset, error: rpcError } = await supabase.rpc('requires_password_reset');
    console.log("PROXY RPC requires_password_reset:", { requiresReset, rpcError, userId: user.id, path: request.nextUrl.pathname });
    
    if (requiresReset) {
      if (!isAuthUpdateRoute && !request.nextUrl.pathname.startsWith('/auth/logout')) {
        return NextResponse.redirect(new URL('/auth/update-password', request.url));
      }
    } else {
      // If no reset required but they are on login page, redirect to home
      if (isLoginRoute) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
