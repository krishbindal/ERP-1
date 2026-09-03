import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  let user = null
  for (let i = 0; i < 5; i++) {
    const res = await supabase.auth.getUser()
    user = res.data?.user ?? null
    if (!res.error || res.error.message !== 'Failed to fetch') break
    console.warn(`proxy auth lookup failed to fetch; retry ${i + 1}/5`)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const pathname = request.nextUrl.pathname
  const isLoginRoute = pathname === '/login'
  const isAuthUpdateRoute = pathname === '/auth/update-password'
  const isLogoutRoute = pathname === '/auth/logout'

  if (!user && !isLoginRoute && !isLogoutRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    const { data: requiresReset, error: rpcError } = await supabase.rpc('requires_password_reset')

    if (rpcError) {
      console.error('Password reset security check failed', { code: rpcError.code ?? 'unknown' })
      if (!isLoginRoute && !isLogoutRoute) {
        return NextResponse.redirect(new URL('/login?error=security-check', request.url))
      }
      return response
    }

    if (requiresReset) {
      if (!isAuthUpdateRoute && !isLogoutRoute) {
        return NextResponse.redirect(new URL('/auth/update-password', request.url))
      }
    } else if (isLoginRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
