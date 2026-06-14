import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Referral } from '@/core/entities/referral'

export function useReferral() {
    const supabase = createClient()
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [referralCode, setReferralCode] = useState<string | null>(null)
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [loading, setLoading] = useState(true)

    const siteUrl = typeof window !== 'undefined'
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://petnova.app')

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) { router.push('/auth'); return }
            setUser(user)

            // Get referral code
            const { data: profile } = await supabase
                .from('profiles')
                .select('referral_code')
                .eq('id', user.id)
                .single()

            if (profile?.referral_code) setReferralCode(profile.referral_code)

            // Get referrals this user made
            const { data: refData } = await supabase
                .from('referrals')
                .select('id, invitee_id, rewarded, created_at')
                .eq('inviter_id', user.id)
                .order('created_at', { ascending: false })

            if (refData && refData.length > 0) {
                const ids = refData.map(r => r.invitee_id)
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, display_name, full_name')
                    .in('id', ids)

                const nameMap: Record<string, string> = {}
                profilesData?.forEach(p => {
                    nameMap[p.id] = p.display_name ?? p.full_name ?? 'Usuario'
                })

                setReferrals(refData.map(r => ({
                    ...r,
                    invitee_name: nameMap[r.invitee_id] ?? 'Usuario',
                })))
            }

            setLoading(false)
        })
    }, [supabase, router])

    const referralLink = referralCode ? `${siteUrl}/auth?ref=${referralCode}` : ''

    return {
        user,
        referralCode,
        referrals,
        loading,
        referralLink
    }
}
