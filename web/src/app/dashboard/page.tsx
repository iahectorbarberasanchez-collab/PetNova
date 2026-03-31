'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import Sidebar from '@/components/Sidebar'
import { motion } from 'framer-motion'
import { Plus, PawPrint, Activity, Heart, Bell } from 'lucide-react'
import { usePets } from '@/hooks/usePets'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { ProactiveTip } from '@/components/ui/ProactiveTip'
import { PetList } from '@/components/PetList'
import { UpcomingEvents } from '@/components/UpcomingEvents'

export default function DashboardPage() {
    const { userId, profile, loading: loadingUser } = useUser()
    const [mounted, setMounted] = useState(false)
    const [today] = useState(() => new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }))

    const { pets, loading: loadingPets } = usePets(userId)

    useEffect(() => {
        setMounted(true)
    }, [])

    const displayName = profile?.display_name || 'Aventurero'

    if (!mounted || loadingUser || loadingPets) return (
        <div className="min-h-screen flex items-center justify-center bg-[#07070F]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <div className="text-4xl mb-4 animate-bounce">🐾</div>
                <p className="text-white/40 font-outfit">Sincronizando tu mundo animal...</p>
            </motion.div>
        </div>
    )

    const metrics = [
        { icon: <PawPrint size={20} />, label: 'Mascotas', value: String(pets.length), color: '#8B5CF6', href: '/dashboard/pets' },
        { icon: <Activity size={20} />, label: 'Salud', value: 'Al día', color: '#00D4FF', href: '/dashboard/health' },
        { icon: <Heart size={20} />, label: 'Comunidad', value: 'Explorar', color: '#10B981', href: '/dashboard/social' },
        { icon: <Bell size={20} />, label: 'Alertas', value: '0', color: '#F59E0B', href: '/dashboard/alerts' },
    ]

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="dashboard-main lg:ml-[260px] relative min-h-screen">
                <div className="noise-overlay pointer-events-none" />
                
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[80px] pb-[120px] lg:pt-8 lg:pb-8">
                    <PageHeader
                        title={`¡Hola de nuevo, ${displayName}!`}
                        subtitle={today}
                        emoji="✨"
                        action={
                            <PremiumButton href="/dashboard/pets/new" icon={<Plus size={18} />}>
                                Nueva Mascota
                            </PremiumButton>
                        }
                    />

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                        {metrics.map((m, i) => (
                            <StatCard key={m.label} {...m} delay={i * 0.1} />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-8">
                            <PetList pets={pets} />

                            {/* Proactive Tip / PetBot AI */}
                            {pets.length > 0 && (
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                                    <ProactiveTip pet={pets[0]} />
                                </motion.div>
                            )}
                        </div>

                        {/* Secondary Actions / Notifications */}
                        <div className="space-y-6">
                            <UpcomingEvents userId={userId} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

