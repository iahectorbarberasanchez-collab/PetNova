'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { 
  Home, 
  PawPrint, 
  MessageSquare, 
  BookOpen, 
  Map as MapIcon, 
  Camera, 
  Users, 
  Bell, 
  Heart, 
  Gift, 
  ShoppingBag, 
  Briefcase, 
  Settings,
  LogOut,
  ChevronRight,
  Calendar,
  Activity,
  Library,
  Stethoscope
} from 'lucide-react'

const menuCategories = [
    {
        title: 'Principal',
        items: [
            { icon: <Home size={18} />, label: 'Inicio', href: '/dashboard' },
            { icon: <PawPrint size={18} />, label: 'Mis Mascotas', href: '/dashboard/pets' },
            { icon: <MessageSquare size={18} />, label: 'PetBot', href: '/dashboard/petbot' },
        ]
    },
    {
        title: 'Gestión',
        items: [
            { icon: <BookOpen size={18} />, label: 'Cartilla', href: '/dashboard/health' },
            { icon: <Calendar size={18} />, label: 'Calendario', href: '/dashboard/calendar' },
            { icon: <Activity size={18} />, label: 'Bienestar', href: '/dashboard/wellness' },
            { icon: <MapIcon size={18} />, label: 'Mapa', href: '/dashboard/map' },
        ]
    },
    {
        title: 'Recursos',
        items: [
            { icon: <Library size={18} />, label: 'PetWiki', href: '/dashboard/wiki' },
            { icon: <Stethoscope size={18} />, label: 'Primeros Auxilios', href: '/dashboard/first-aid' },
        ]
    },
    {
        title: 'Comunidad',
        items: [
            { icon: <Camera size={18} />, label: 'Social', href: '/dashboard/social' },
            { icon: <Users size={18} />, label: 'Amigos', href: '/dashboard/friends' },
            { icon: <Bell size={18} />, label: 'Alertas SOS', href: '/dashboard/alerts' },
            { icon: <Heart size={18} />, label: 'Machos/Hembras', href: '/dashboard/match' },
            { icon: <Gift size={18} />, label: 'Invitar', href: '/dashboard/referral' },
        ]
    },
    {
        title: 'Servicios',
        items: [
            { icon: <ShoppingBag size={18} />, label: 'Tienda', href: '/dashboard/shop' },
            { icon: <Briefcase size={18} />, label: 'Servicios', href: '/dashboard/services' },
        ]
    },
    {
        title: 'Otros',
        items: [
            { icon: <Settings size={18} />, label: 'Ajustes', href: '/dashboard/settings' },
        ]
    }
]

export default function Sidebar() {
    const supabase = createClient()
    const router = useRouter()
    const pathname = usePathname()

    const [petCoins, setPetCoins] = useState<number | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (user) {
                const { data } = await supabase.from('profiles').select('pet_coins').eq('id', user.id).single()
                if (data) setPetCoins(data.pet_coins)
            }
        })
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    return (        <aside className="fixed top-0 left-0 bottom-0 w-[260px] hidden lg:flex flex-col bg-[var(--surface)] border-r border-[var(--border)] backdrop-blur-3xl z-[var(--z-sidebar)] shadow-2xl">
            {/* Logo Section */}
            <div className="p-7 border-b border-[var(--border)]">
                <Link href="/dashboard" className="flex items-center gap-4 no-underline group">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-[var(--primary)]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img src="/logo.png" alt="PetNova" className="w-11 h-11 rounded-2xl shadow-[0_8px_30px_rgba(108,63,245,0.3)] object-cover group-hover:scale-105 transition-all duration-500" />
                    </div>
                    <div>
                        <h1 className="font-[var(--font-heading)] font-black text-xl leading-none tracking-tight bg-gradient-to-br from-white via-white to-[var(--primary)] bg-clip-text text-transparent">
                            PetNova
                        </h1>
                        <p className="text-[10px] text-[var(--text-dim)] font-bold tracking-[0.22em] uppercase mt-1.5 opacity-60">Control Panel</p>
                    </div>
                </Link>

                {/* PetCoins Badge */}
                {petCoins !== null && (
                    <Link href="/dashboard/petcoins" className="mt-7 flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl group hover:from-amber-500/20 transition-all duration-300">
                        <div className="flex items-center gap-2.5 text-amber-500 font-[var(--font-heading)] font-black text-sm">
                            <span className="text-xl group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">🪙</span>
                            <span className="tracking-tight">{petCoins.toLocaleString()}</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    </Link>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto scrollbar-hide">
                {menuCategories.map((category) => (
                    <div key={category.title} className="space-y-2">
                        <h3 className="px-4 text-[11px] font-black text-[var(--text-dim)] uppercase tracking-[0.25em] mb-3 opacity-40">
                            {category.title}
                        </h3>
                        <div className="space-y-1">
                            {category.items.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                                return (
                                    <Link 
                                        key={item.label} 
                                        href={item.href}
                                        className={`
                                            flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300 group relative
                                            ${isActive 
                                                ? 'bg-[var(--primary)]/10 text-[var(--text)] border border-[var(--primary)]/30 shadow-[0_4px_20px_rgba(108,63,245,0.15)] ring-1 ring-[var(--primary)]/20' 
                                                : 'text-[var(--text-dim)] hover:bg-white/5 hover:text-white border border-transparent'
                                            }
                                        `}
                                    >
                                        <span className={`transition-all duration-500 group-hover:scale-110 ${isActive ? 'text-[var(--primary-light)]' : 'opacity-40 group-hover:opacity-100 group-hover:text-[var(--primary-light)]'}`}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                        {isActive && (
                                            <motion.div 
                                                layoutId="active-nav"
                                                className="absolute left-0 w-1 h-5 bg-[var(--primary)] rounded-r-full"
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-6 border-t border-[var(--border)]">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[var(--text-dim)] font-[var(--font-heading)] font-black text-xs hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 group transition-all duration-500"
                >
                    <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    )
}
