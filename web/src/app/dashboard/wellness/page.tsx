'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { Activity, Smile, Scale, LucideIcon, Gift, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useWellness } from '@/features/wellness/hooks/useWellness'
import { WeightChart } from '@/features/wellness/components/WeightChart'
import { BehaviorList } from '@/features/wellness/components/BehaviorList'
import { MOODS } from '@/core/entities/pet'

const SectionHeader = ({ title, icon: Icon, action }: { title: string, icon: LucideIcon, action?: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary-light)] shadow-inner">
                <Icon size={24} />
            </div>
            <h3 className="text-xl font-black tracking-tight">{title}</h3>
        </div>
        {action}
    </div>
)

export default function WellnessPage() {
    const {
        pets,
        selectedPetId,
        setSelectedPetId,
        weightHistory,
        behaviorHistory,
        loading,
        addWeight,
        addBehavior
    } = useWellness()

    const [showWeightModal, setShowWeightModal] = useState(false)
    const [showBehaviorModal, setShowBehaviorModal] = useState(false)

    // Form inputs
    const [newWeight, setNewWeight] = useState('')
    const [newMood, setNewMood] = useState('Good')
    const [newEnergy, setNewEnergy] = useState(5)
    const [newNotes, setNewNotes] = useState('')

    const handleAddWeight = async (e: React.FormEvent) => {
        e.preventDefault()
        const { error } = await addWeight(parseFloat(newWeight))
        if (!error) { setShowWeightModal(false); setNewWeight('') }
    }

    const handleAddBehavior = async (e: React.FormEvent) => {
        e.preventDefault()
        const { error } = await addBehavior(newMood, newEnergy, newNotes)
        if (!error) { setShowBehaviorModal(false); setNewNotes(''); setNewEnergy(5) }
    }



    if (loading) return <div className="flex items-center justify-center h-screen font-black text-2xl tracking-widest opacity-20 animate-pulse">CARGANDO...</div>

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 bg-gradient-to-br from-white via-white to-[var(--primary)] bg-clip-text text-transparent">
                            Centro de Bienestar
                        </h1>
                        <p className="text-[var(--text-dim)] font-medium text-lg">Control físico y emocional de tus mascotas.</p>
                    </div>
                    <select 
                        className="w-full md:w-auto px-6 py-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-white font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-[var(--primary)]/50 outline-none transition-all" 
                        value={selectedPetId} 
                        onChange={e => setSelectedPetId(e.target.value)}
                    >
                        {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                <div className="space-y-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative group">
                        <Link href="/dashboard/referral">
                            <GlassCard className="p-6 md:p-8 overflow-hidden border-none relative" hover={true}>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#6C3FF5]/20 via-transparent to-[#00D4FF]/10 opacity-50 group-hover:opacity-80 transition-opacity" />
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#F59E0B] flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                                            <Gift size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight mb-1">¡Gana PetCoins invitando amigos! 🪙</h3>
                                            <p className="text-[var(--text-dim)] font-medium">Tú recibes 50 PC y tu amigo 100 PC al unirse a la red.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 font-black text-sm tracking-widest text-[#00D4FF] group-hover:gap-4 transition-all">
                                        INVITAR AHORA <ArrowRight size={18} />
                                    </div>
                                </div>
                            </GlassCard>
                        </Link>
                    </motion.div>

                    <GlassCard className="p-8 md:p-10" hover={false}>
                        <SectionHeader 
                            title="Historial de Peso" 
                            icon={Scale} 
                            action={<PremiumButton onClick={() => setShowWeightModal(true)} variant="primary">+ REGISTRO</PremiumButton>}
                        />
                        <WeightChart weightHistory={weightHistory} />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            {weightHistory.slice(0, 4).map((w, i) => (
                                <motion.div 
                                    key={w.id} 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl text-center"
                                >
                                    <div className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-wider mb-1">{new Date(w.recorded_at).toLocaleDateString()}</div>
                                    <div className="text-2xl font-black tracking-tighter">{w.weight_kg} <span className="text-sm opacity-40">kg</span></div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <GlassCard className="lg:col-span-2 p-8 md:p-10" hover={false}>
                            <SectionHeader 
                                title="Estado de Ánimo" 
                                icon={Smile} 
                                action={<PremiumButton onClick={() => setShowBehaviorModal(true)} variant="ghost">NUEVO LOG</PremiumButton>}
                            />
                            <BehaviorList behaviorHistory={behaviorHistory} />
                        </GlassCard>

                        <GlassCard className="p-8 md:p-10 flex flex-col justify-between" hover={false} delay={0.2}>
                            <div>
                                <SectionHeader title="IA Tips" icon={Activity} />
                                <div className="bg-[var(--primary)]/5 rounded-[2rem] p-8 border border-[var(--primary)]/10 shadow-inner relative overflow-hidden group">
                                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-[var(--primary)]/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000" />
                                    <p className="text-[var(--primary-light)] font-bold leading-relaxed relative z-10 text-lg">
                                        &ldquo;Basado en los datos de esta semana, el nivel de energía ha bajado un 20%. Considera una revisión de salud si persiste.&rdquo;
                                    </p>
                                </div>
                            </div>
                            <div className="mt-8 pt-8 border-t border-[var(--border)]">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest opacity-40">
                                    <span>Próximo Recordatorio</span>
                                    <span>Mañana, 09:00</span>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showWeightModal && (
                    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[var(--background)]/80 backdrop-blur-md" onClick={() => setShowWeightModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-[var(--background)] border border-[var(--border)] rounded-[2.5rem] p-10 shadow-2xl">
                            <h3 className="text-2xl font-black mb-8 tracking-tight">Registrar Peso</h3>
                            <form onSubmit={handleAddWeight} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-3 block">PESO EN KG</label>
                                    <input type="number" step="0.01" className="w-full h-16 px-6 rounded-2xl bg-white/5 border border-white/10 font-black text-2xl focus:border-[var(--primary)] outline-none transition-all" value={newWeight} onChange={e => setNewWeight(e.target.value)} required autoFocus />
                                </div>
                                <PremiumButton type="submit" className="w-full h-16 text-lg">GUARDAR CAMBIOS</PremiumButton>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showBehaviorModal && (
                    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[var(--background)]/80 backdrop-blur-md" onClick={() => setShowBehaviorModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-[var(--background)] border border-[var(--border)] rounded-[2.5rem] p-10 shadow-2xl">
                            <h3 className="text-2xl font-black mb-8 tracking-tight">Log de Comportamiento</h3>
                            <form onSubmit={handleAddBehavior} className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-4 block">¿CÓMO SE SIENTE?</label>
                                    <div className="grid grid-cols-5 gap-3">
                                        {MOODS.map(m => (
                                            <button key={m.value} type="button" onClick={() => setNewMood(m.value)} className={`aspect-square flex items-center justify-center text-3xl rounded-2xl transition-all duration-300 ${newMood === m.value ? 'bg-[var(--primary)] scale-110 shadow-lg' : 'bg-white/5 opacity-40 hover:opacity-100 hover:bg-white/10'}`}>{m.emoji}</button>
                                        ))}
                                    </div>
                                    <p className="text-center mt-3 font-bold text-[var(--primary-light)]">{MOODS.find(m => m.value === newMood)?.label}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-4 block">ENERGÍA (1-10)</label>
                                    <input type="range" min="1" max="10" className="w-full accent-[var(--primary)] h-2 cursor-pointer" value={newEnergy} onChange={e => setNewEnergy(parseInt(e.target.value))} />
                                    <div className="text-center text-4xl font-black mt-4 text-[var(--primary)]">{newEnergy}</div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-3 block">OBSERVACIONES</label>
                                    <textarea className="w-full p-6 h-32 rounded-2xl bg-white/5 border border-white/10 font-bold focus:border-[var(--primary)] outline-none transition-all resize-none" value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="¿Has notado algo inusual?" />
                                </div>
                                <PremiumButton type="submit" className="w-full h-16 text-lg">GUARDAR LOG DIARIO</PremiumButton>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    )
}
