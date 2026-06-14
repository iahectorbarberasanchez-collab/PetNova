import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Referral } from '@/core/entities/referral'

interface ReferralHistoryProps {
    referrals: Referral[]
}

export function ReferralHistory({ referrals }: ReferralHistoryProps) {
    if (referrals.length === 0) {
        return (
            <GlassCard className="p-10 text-center" hover={false}>
                <div className="text-5xl mb-4">🐾</div>
                <p className="font-outfit font-bold text-lg text-white/60 mb-2">Aún no has invitado a nadie</p>
                <p className="text-white/35 font-inter text-sm">Comparte tu enlace y empieza a ganar PetCoins por cada amigo que se una.</p>
            </GlassCard>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {referrals.map((ref, i) => (
                <motion.div
                    key={ref.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.06 }}
                >
                    <GlassCard className="p-4 flex items-center gap-4" hover={false}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                            style={{ background: 'linear-gradient(135deg, rgba(108,63,245,0.25), rgba(0,212,255,0.15))', border: '1px solid rgba(108,63,245,0.25)' }}>
                            🐾
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-outfit font-bold text-sm text-white">{ref.invitee_name}</p>
                            <p className="text-white/35 font-inter text-xs mt-0.5">
                                Se unió el {new Date(ref.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        {ref.rewarded ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-outfit font-bold text-xs"
                                style={{ background: 'rgba(0,229,160,0.12)', border: '1px solid rgba(0,229,160,0.28)', color: '#00E5A0' }}>
                                ✅ +50 🪙
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-outfit font-bold text-xs"
                                style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', color: '#FFD700' }}>
                                ⏳ Pendiente
                            </div>
                        )}
                    </GlassCard>
                </motion.div>
            ))}
        </div>
    )
}
