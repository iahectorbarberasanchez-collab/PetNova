import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json()

        if (!code || typeof code !== 'string') {
            return NextResponse.json({ error: 'Missing referral code' }, { status: 400 })
        }

        const cookieStore = await cookies()

        // Use anon client to get current user
        const supabaseUser = createServerClient(
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

        const { data: { user } } = await supabaseUser.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
        }

        // Use service-role client to call the SECURITY DEFINER function
        const supabaseAdmin = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll() { },
                },
            }
        )

        const { data, error } = await supabaseAdmin.rpc('process_referral', {
            p_code: code.toUpperCase().trim(),
            p_invitee_id: user.id,
        })

        if (error) {
            console.error('[referral/process] RPC error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (err) {
        console.error('[referral/process] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
