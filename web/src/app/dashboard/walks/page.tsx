'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    MapPin, 
    Calendar, 
    Clock, 
    TrendingUp, 
    Trash2, 
    ChevronRight,
    Search,
    Filter,
    Plus,
    Navigation,
    Timer,
    Zap,
    Loader2
} from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Breadcrumbs from '@/components/Breadcrumbs'
import { PageHeader } from '@/components/ui/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { PremiumButton } from '@/components/ui/PremiumButton'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Walk {
    id: string
    user_id: string
    pet_id: string | null
    title: string
    route: { lat: number, lng: number, timestamp: number }[]
    distance_km: number
    duration_seconds: number
    start_time: string
    end_time: string | null
    image_url: string | null
    earned_coins: number
    created_at: string
    pet?: { name: string; species: string; avatar_url: string | null } | null
    profile?: { display_name: string | null } | null
}

const SPECIES_EMOJI: Record<string, string> = {
    Dog: '🐶', Cat: '🐱', Bird: '🐦', Fish: '🐠', Rabbit: '🐇', Hamster: '🐹', Reptile: '🦎', Other: '🐾',
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
    if (diff < 60) return 'Ahora'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
}

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
}

export default function WalksPage() {
    const supabase = createClient()
    const router = useRouter()

    const [userId, setUserId] = useState<string | null>(null)
    const [walks, setWalks] = useState<Walk[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) { router.push('/auth'); return }
            setUserId(user.id)
            await loadWalks()
        })
    }, [])

    const loadWalks = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('walks')
            .select(`*, pet:pets(name, species, avatar_url), profile:profiles(display_name)`)
            .order('created_at', { ascending: false })
            .limit(50)

        if (data && !error) {
            setWalks(data)
        }
        setLoading(false)
    }

    const handleDeleteWalk = async (walk: Walk) => {
        if (!confirm('¿Eliminar este paseo?')) return
        if (walk.image_url) {
            const path = walk.image_url.split('/walk-images/')[1]
            if (path) await supabase.storage.from('walk-images').remove([path])
        }
        await supabase.from('walks').delete().eq('id', walk.id)
        setWalks(prev => prev.filter(w => w.id !== walk.id))
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <Breadcrumbs items={[{ label: 'Paseos' }]} />
                
                <PageHeader 
                    title="Aventuras" 
                    subtitle="El historial de rutas y descubrimientos de la comunidad" 
                    emoji="🌍"
                    action={
                        <Link href="/dashboard/walks/record" className="no-underline">
                            <PremiumButton className="!px-6">
                                <Plus size={18} className="mr-2" />
                                NUEVO PASEO
                            </PremiumButton>
                        </Link>
                    }
                />

                <div className="max-w-4xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-32"
                            >
                                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Cargando rutas...</p>
                            </motion.div>
                        ) : walks.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-32"
                            >
                                <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/10">
                                    <Navigation className="text-primary/40" size={40} />
                                </div>
                                <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Sin huellas aún</h3>
                                <p className="text-white/40 mb-8 max-w-sm mx-auto font-medium">Sé el primero en grabar una ruta con tu mascota y comienza a ganar PetCoins.</p>
                                <Link href="/dashboard/walks/record" className="no-underline">
                                    <PremiumButton>COMENZAR PRIMER PASEO</PremiumButton>
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-8 relative"
                            >
                                {/* Vertical Timeline Line */}
                                <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/5 to-transparent hidden md:block" />

                                {walks.map((walk, idx) => (
                                    <motion.div
                                        key={walk.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <GlassCard className="relative md:ml-16 overflow-hidden hover:border-primary/30 transition-all group">
                                            {/* Top Banner for Pet */}
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="relative">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 flex items-center justify-center text-2xl shadow-inner group-hover:rotate-6 transition-transform duration-500">
                                                        {walk.pet ? SPECIES_EMOJI[walk.pet.species || 'Other'] : '👤'}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-black border border-white/10 flex items-center justify-center text-[10px] font-black text-primary">
                                                        {idx + 1}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-black text-lg uppercase tracking-tight text-white group-hover:text-primary transition-colors">
                                                            {walk.title || 'Exploración PetNova'}
                                                        </h3>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 bg-white/5 py-1 px-3 rounded-full border border-white/5">
                                                            {timeAgo(walk.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-bold text-white/40 flex items-center gap-2 mt-0.5">
                                                        <span className="text-primary/60">{walk.profile?.display_name || 'Explorador'}</span>
                                                        <span className="opacity-20">•</span>
                                                        <span>con {walk.pet?.name || 'su mascota'}</span>
                                                    </p>
                                                </div>

                                                {walk.user_id === userId && (
                                                    <button 
                                                        onClick={() => handleDeleteWalk(walk)}
                                                        className="p-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/40 hover:bg-red-500/20 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Stats Strip */}
                                            <div className="grid grid-cols-3 gap-4 mb-6 bg-white/5 rounded-2xl border border-white/5 p-5 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                                                <div className="text-center md:text-left">
                                                    <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest mb-1.5">
                                                        <Navigation size={12} className="text-primary" /> Distancia
                                                    </div>
                                                    <div className="text-xl font-black text-white tabular-nums">
                                                        {walk.distance_km?.toFixed(2)}<span className="text-[10px] ml-1 opacity-40">KM</span>
                                                    </div>
                                                </div>
                                                <div className="text-center md:text-left border-x border-white/5 px-4">
                                                    <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest mb-1.5">
                                                        <Timer size={12} className="text-secondary" /> Tiempo
                                                    </div>
                                                    <div className="text-xl font-black text-white tabular-nums">
                                                        {formatDuration(walk.duration_seconds)}
                                                    </div>
                                                </div>
                                                <div className="text-center md:text-left">
                                                    <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest mb-1.5">
                                                        <Zap size={12} className="text-yellow-500" /> Recompensa
                                                    </div>
                                                    <div className="text-xl font-black text-yellow-500 tabular-nums">
                                                        +{walk.earned_coins || 0} <span className="text-[10px] ml-0.5 opacity-60">PC</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Visual */}
                                            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-white/10 group-hover:border-primary/20 transition-all">
                                                {walk.image_url ? (
                                                    <img src={walk.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Ruta" />
                                                ) : (
                                                    <div className="w-full h-full bg-[#0A0A16] flex flex-col items-center justify-center p-8 text-center">
                                                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 transition-transform">
                                                            <MapPin className="text-white/20" size={32} />
                                                        </div>
                                                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Mapa de Exploración</div>
                                                        {/* Decorative path */}
                                                        <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" viewBox="0 0 100 100">
                                                            <path d="M10 50 Q 25 25, 40 50 T 70 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                                
                                                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60">
                                                        <Calendar size={12} className="text-primary" />
                                                        {new Date(walk.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                                                    </div>
                                                    <Link href={`/dashboard/walks/${walk.id}`} className="no-underline">
                                                        <button className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all flex items-center gap-2">
                                                            Detalles <ChevronRight size={14} />
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                ))}
                                
                                <div className="text-center py-12">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10">Has llegado al final</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    )
}
