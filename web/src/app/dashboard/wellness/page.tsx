'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { Activity, Smile, Scale, LucideIcon, Gift, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// --- Types ---
interface WeightEntry {
    id: string; pet_id: string; weight_kg: number; recorded_at: string
}
interface BehaviorEntry {
    id: string; pet_id: string; mood: string; energy_level: number; notes: string | null; recorded_at: string
}
interface Pet {
    id: string; name: string; species: string
}

const MOODS = [
  { emoji: '🤩', label: 'Eufórico', value: 'Excellent' },
  { emoji: '😊', label: 'Feliz', value: 'Good' },
  { emoji: '😐', label: 'Normal', value: 'Neutral' },
  { emoji: '😔', label: 'Triste', value: 'Sad' },
  { emoji: '🤒', label: 'Enfermito', value: 'Sick' },
]

export default function WellnessPage() {
    const supabase = createClient()
    const [pets, setPets] = useState<Pet[]>([])
    const [selectedPetId, setSelectedPetId] = useState<string>('')
    const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([])
    const [behaviorHistory, setBehaviorHistory] = useState<BehaviorEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [showWeightModal, setShowWeightModal] = useState(false)
    const [showBehaviorModal, setShowBehaviorModal] = useState(false)

    // Form inputs
    const [newWeight, setNewWeight] = useState('')
    const [newMood, setNewMood] = useState('Good')
    const [newEnergy, setNewEnergy] = useState(5)
    const [newNotes, setNewNotes] = useState('')

    useEffect(() => {
        fetchInitial()
    }, [])

    useEffect(() => {
        if (selectedPetId) fetchPetData(selectedPetId)
    }, [selectedPetId])

    const fetchInitial = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: petsData } = await supabase.from('pets').select('id, name, species').eq('owner_id', user.id)
        if (petsData && petsData.length > 0) {
            setPets(petsData)
            setSelectedPetId(petsData[0].id)
        }
        setLoading(false)
    }

    const fetchPetData = async (petId: string) => {
        const { data: weight } = await supabase.from('pet_weight_history').select('*').eq('pet_id', petId).order('recorded_at', { ascending: false })
        const { data: behavior } = await supabase.from('pet_behavior_logs').select('*').eq('pet_id', petId).order('recorded_at', { ascending: false })
        setWeightHistory(weight || [])
        setBehaviorHistory(behavior || [])
    }

    const handleAddWeight = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPetId || !newWeight) return
        const { error } = await supabase.from('pet_weight_history').insert({
            pet_id: selectedPetId, weight_kg: parseFloat(newWeight)
        })
        if (!error) { fetchPetData(selectedPetId); setShowWeightModal(false); setNewWeight('') }
    }

    const handleAddBehavior = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPetId) return
        const { error } = await supabase.from('pet_behavior_logs').insert({
            pet_id: selectedPetId, mood: newMood, energy_level: newEnergy, notes: newNotes || null
        })
        if (!error) { fetchPetData(selectedPetId); setShowBehaviorModal(false); setNewNotes(''); setNewEnergy(5) }
    }

    // Chart Helper (Simple Line Chart with SVG)
    const renderWeightChart = () => {
        if (weightHistory.length < 2) return <div className="h-[200px] flex items-center justify-center text-[var(--text-dim)] text-sm">Añade al menos 2 registros para ver la tendencia.</div>
        
        const data = [...weightHistory].reverse()
        const maxWeight = Math.max(...data.map(d => d.weight_kg)) * 1.1
        const minWeight = Math.min(...data.map(d => d.weight_kg)) * 0.9
        const range = maxWeight - minWeight
        const width = 800; const height = 200
        const points = data.map((d, i) => ({
            x: (i / (data.length - 1)) * width,
            y: height - ((d.weight_kg - minWeight) / range) * height
        }))

        const pathD = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '')

        return (
            <div className="py-6">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[200px] overflow-visible">
                    <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" />
                            <stop offset="100%" stopColor="var(--secondary)" />
                        </linearGradient>
                    </defs>
                    <motion.path 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" 
                    />
                    {points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="6" className="fill-[var(--background)] stroke-[var(--primary-light)] stroke-[2px]" />
                    ))}
                </svg>
                <div className="flex justify-between mt-4 opacity-30 text-[10px] font-bold uppercase tracking-wider">
                    <span>{new Date(data[0].recorded_at).toLocaleDateString()}</span>
                    <span className="text-[var(--primary)]">Evolución de Masa Corporal</span>
                    <span>{new Date(data[data.length-1].recorded_at).toLocaleDateString()}</span>
                </div>
            </div>
        )
    }

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

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                {/* --- Header Section --- */}
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
                    {/* --- Invitation Banner --- */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="relative group"
                    >
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
                    {/* --- Weight Section --- */}
                    <GlassCard className="p-8 md:p-10" hover={false}>
                        <SectionHeader 
                            title="Historial de Peso" 
                            icon={Scale} 
                            action={<PremiumButton onClick={() => setShowWeightModal(true)} variant="primary">+ REGISTRO</PremiumButton>}
                        />
                        {renderWeightChart()}
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

                    {/* --- Behavior & Tips --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <GlassCard className="lg:col-span-2 p-8 md:p-10" hover={false}>
                            <SectionHeader 
                                title="Estado de Ánimo" 
                                icon={Smile} 
                                action={<PremiumButton onClick={() => setShowBehaviorModal(true)} variant="ghost">NUEVO LOG</PremiumButton>}
                            />
                            <div className="space-y-4">
                                {behaviorHistory.slice(0, 5).map((log, i) => {
                                    const moodObj = MOODS.find(m => m.value === log.mood)
                                    return (
                                        <motion.div 
                                            key={log.id} 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-6 p-5 rounded-3xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-colors group"
                                        >
                                            <div className="text-4xl drop-shadow-lg group-hover:scale-110 transition-transform">{moodObj?.emoji || '🐾'}</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="font-black text-lg tracking-tight">{moodObj?.label}</span>
                                                    <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{new Date(log.recorded_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {[...Array(10)].map((_, i) => (
                                                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i < log.energy_level ? 'bg-[var(--primary)]' : 'bg-white/5 blur-[0.5px]'}`} />
                                                    ))}
                                                </div>
                                                {log.notes && <p className="mt-4 text-sm text-[var(--text-dim)] font-medium leading-relaxed italic">"{log.notes}"</p>}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                                {behaviorHistory.length === 0 && <p className="text-center py-10 text-[var(--text-dim)] font-bold italic opacity-40">Sin registros de comportamiento.</p>}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8 md:p-10 flex flex-col justify-between" hover={false} delay={0.2}>
                            <div>
                                <SectionHeader title="IA Tips" icon={Activity} />
                                <div className="bg-[var(--primary)]/5 rounded-[2rem] p-8 border border-[var(--primary)]/10 shadow-inner relative overflow-hidden group">
                                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-[var(--primary)]/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000" />
                                    <p className="text-[var(--primary-light)] font-bold leading-relaxed relative z-10 text-lg">
                                        "Basado en los datos de esta semana, el nivel de energía ha bajado un 20%. Considera una revisión de salud si persiste."
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

            {/* MODALS */}
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
