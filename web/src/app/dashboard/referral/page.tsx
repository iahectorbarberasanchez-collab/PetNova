'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import { PageHeader } from '@/components/ui/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Users, Gift, TrendingUp, Mail, Facebook, Twitter } from 'lucide-react'
import { useReferral } from '@/features/referral/hooks/useReferral'
import { ReferralHistory } from '@/features/referral/components/ReferralHistory'

export default function ReferralPage() {
    const { referrals, referralCode, referralLink, loading } = useReferral()
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        if (!referralLink) return
        await navigator.clipboard.writeText(referralLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
    }

    if (loading) return (
        <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C3FF5]"></div>
        </div>
    )

    const totalEarned = referrals.filter(r => r.rewarded).length * 50

    return (
        <div className="dashboard-container min-h-screen bg-dark-bg text-white">
            <Sidebar />
            <main className="dashboard-main lg:ml-[260px] pb-16 relative overflow-hidden">
                <div className="noise-overlay" />
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(108,63,245,0.1)_0%,transparent_60%)] pointer-events-none blur-3xl" />
                <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,212,255,0.07)_0%,transparent_60%)] pointer-events-none blur-3xl" />

                <div className="relative z-10">
                    <PageHeader
                        title="Invitar Amigos"
                        emoji="🎁"
                        subtitle="Comparte PetNova con quien quieras. Tú ganas PetCoins, ellos también."
                    />

                    {/* ── STATS ROW ── */}
                    <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                        {[
                            { icon: <Users className="text-[#A78BFA]" size={20} />, label: 'Amigos invitados', value: referrals.length, color: '#A78BFA' },
                            { icon: <TrendingUp className="text-[#FFD700]" size={20} />, label: 'PetCoins ganados', value: `${totalEarned} 🪙`, color: '#FFD700' },
                            { icon: <Gift className="text-[#00E5A0]" size={20} />, label: 'Por cada amigo', value: '+50 🪙', color: '#00E5A0' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                            >
                                <GlassCard className="p-5 flex items-center gap-4" hover={false}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${stat.color}18` }}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-white/40 font-inter text-xs mb-0.5">{stat.label}</p>
                                        <p className="font-outfit font-extrabold text-xl text-white">{stat.value}</p>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>

                    {/* ── HOW IT WORKS ── */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="max-w-4xl mx-auto mb-10">
                        <GlassCard className="p-6" hover={false}>
                            <h3 className="font-outfit font-extrabold text-lg mb-5 text-white/90">¿Cómo funciona?</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                {[
                                    { step: '①', color: '#A78BFA', title: 'Comparte tu link', desc: 'Copia tu enlace personal y envíaselo a un amigo.' },
                                    { step: '②', color: '#00D4FF', title: 'Se registra', desc: 'Tu amigo se registra en PetNova a través de tu enlace.' },
                                    { step: '③', color: '#00E5A0', title: '¡Ambos ganáis!', desc: 'Tu amigo recibe 100 PetCoins y tú recibes 50 PetCoins.' },
                                ].map((s, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <span className="font-outfit font-extrabold text-2xl shrink-0" style={{ color: s.color }}>{s.step}</span>
                                        <div>
                                            <p className="font-outfit font-bold text-sm mb-1" style={{ color: s.color }}>{s.title}</p>
                                            <p className="text-white/50 font-inter text-xs leading-relaxed">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* ── MY REFERRAL LINK ── */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                        className="max-w-4xl mx-auto mb-10">
                        <GlassCard className="p-7 relative overflow-hidden" hover={false}>
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(108,63,245,0.1)_0%,transparent_60%)] pointer-events-none" />

                            <h3 className="font-outfit font-extrabold text-lg mb-1 text-white relative z-10">Tu enlace de invitación</h3>
                            <p className="text-white/40 font-inter text-sm mb-5 relative z-10">Compártelo por WhatsApp, Instagram o donde quieras</p>

                            <div className="flex items-center gap-3 mb-5 relative z-10">
                                <span className="text-white/40 font-inter text-sm">Tu código:</span>
                                <span className="px-3 py-1.5 rounded-xl font-outfit font-extrabold text-lg tracking-widest"
                                    style={{ background: 'linear-gradient(135deg, rgba(108,63,245,0.2), rgba(0,212,255,0.12))', border: '1px solid rgba(108,63,245,0.35)', color: '#A78BFA' }}>
                                    {referralCode ?? '--------'}
                                </span>
                            </div>

                            <div className="flex gap-3 items-stretch relative z-10">
                                <div className="flex-1 px-4 py-3 rounded-xl font-inter text-sm text-white/60 truncate"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    {referralLink || 'Cargando...'}
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-outfit font-bold text-sm shrink-0 transition-all border-none cursor-pointer"
                                    style={{
                                        background: copied
                                            ? 'linear-gradient(135deg, #00E5A0, #00D4FF)'
                                            : 'linear-gradient(135deg, #6C3FF5, #00D4FF)',
                                        color: copied ? '#000' : '#fff',
                                        boxShadow: '0 4px 20px rgba(108,63,245,0.35)',
                                    }}
                                >
                                    <AnimatePresence mode="wait">
                                        {copied ? (
                                            <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                <Check size={16} />
                                            </motion.span>
                                        ) : (
                                            <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                <Copy size={16} />
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                    {copied ? '¡Copiado!' : 'Copiar'}
                                </motion.button>
                            </div>

                            <div className="flex gap-3 mt-4 relative z-10 flex-wrap">
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(`🐾 ¡Únete a PetNova, la app para dueños de mascotas! Regístrate con mi enlace y recibirás 100 PetCoins de regalo: ${referralLink}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-outfit font-semibold transition-all hover:scale-105 active:scale-95"
                                    style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366' }}
                                >
                                    <span className="text-base">📱</span> WhatsApp
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🐾 ¡Únete a PetNova y gana 100 PetCoins de regalo! ${referralLink}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-outfit font-semibold transition-all hover:scale-105 active:scale-95"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                                >
                                    <Twitter size={14} /> X (Twitter)
                                </a>
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-outfit font-semibold transition-all hover:scale-105 active:scale-95"
                                    style={{ background: 'rgba(24,119,242,0.12)', border: '1px solid rgba(24,119,242,0.25)', color: '#1877F2' }}
                                >
                                    <Facebook size={14} /> Facebook
                                </a>
                                <a
                                    href={`mailto:?subject=${encodeURIComponent('🐾 ¡Únete a PetNova!')}&body=${encodeURIComponent(`¡Hola! Te invito a unirte a PetNova, la app para dueños de mascotas. Regístrate con mi enlace y recibirás 100 PetCoins de regalo: ${referralLink}`)}`}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-outfit font-semibold transition-all hover:scale-105 active:scale-95"
                                    style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', color: '#FFD700' }}
                                >
                                    <Mail size={14} /> Email
                                </a>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* ── REFERRAL HISTORY ── */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="max-w-4xl mx-auto">
                        <h3 className="font-outfit font-extrabold text-xl mb-5 text-white/90">
                            Amigos que has invitado{' '}
                            {referrals.length > 0 && (
                                <span className="ml-2 text-sm font-inter font-normal text-white/40">({referrals.length})</span>
                            )}
                        </h3>

                        <ReferralHistory referrals={referrals} />
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
