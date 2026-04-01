import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const cookieStore = await cookies()
    const code = requestUrl.searchParams.get('code')
    const ref  = requestUrl.searchParams.get('ref') || cookieStore.get('petnova_ref')?.value
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options))
                    },
                },
            }
        )
        await supabase.auth.exchangeCodeForSession(code)

        // Process referral reward if a code was provided
        if (ref) {
            try {
                await fetch(`${requestUrl.origin}/api/referral/process`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', cookie: request.headers.get('cookie') ?? '' },
                    body: JSON.stringify({ code: ref }),
                })
            } catch {
                // Non-critical: do not block login
            }
        }
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin))
}
