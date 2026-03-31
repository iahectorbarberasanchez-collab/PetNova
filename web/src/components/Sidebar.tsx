'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
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
  ChevronRight
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
            { icon: <MapIcon size={18} />, label: 'Mapa', href: '/dashboard/map' },
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

    return (
        <aside className="fixed top-0 left-0 bottom-0 w-[260px] hidden lg:flex flex-col bg-[#080812]/98 border-r border-[#6C3FF5]/15 backdrop-blur-3xl z-50">
            {/* Logo Section */}
            <div className="p-6 border-b border-[#6C3FF5]/10">
                <Link href="/dashboard" className="flex items-center gap-3 no-underline group">
                    <div className="relative">
                        <img src="/logo.png" alt="PetNova" className="w-10 h-10 rounded-xl shadow-[0_0_20px_rgba(108,63,245,0.4)] object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#8B5CF6]/20 to-transparent pointer-events-none" />
                    </div>
                    <div>
                        <h1 className="font-outfit font-extrabold text-lg leading-tight bg-gradient-to-r from-[#8B5CF6] to-[#00D4FF] bg-clip-text text-transparent">
                            PetNova
                        </h1>
                        <p className="text-[10px] text-white/30 font-medium tracking-wider uppercase mt-0.5">v1.0 Premium</p>
                    </div>
                </Link>

                {/* PetCoins Badge */}
                {petCoins !== null && (
                    <Link href="/dashboard/petcoins" className="mt-5 flex items-center justify-between p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl group hover:bg-yellow-500/15 transition-all">
                        <div className="flex items-center gap-2 text-yellow-500 font-outfit font-bold text-sm">
                            <span className="text-base group-hover:scale-125 transition-transform duration-300">🪙</span>
                            <span>{petCoins.toLocaleString()}</span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-tighter bg-yellow-500/20 px-1.5 py-0.5 rounded-md text-yellow-500">
                            PetCoins
                        </span>
                    </Link>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto scrollbar-hide">
                {menuCategories.map((category) => (
                    <div key={category.title} className="space-y-1">
                        <h3 className="px-3 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2 font-outfit">
                            {category.title}
                        </h3>
                        {category.items.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                            return (
                                <Link 
                                    key={item.label} 
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                                        ${isActive 
                                            ? 'bg-[#6C3FF5]/15 text-[#A78BFA] border border-[#6C3FF5]/30 shadow-[0_0_20px_rgba(108,63,245,0.1)]' 
                                            : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
                                        }
                                    `}
                                >
                                    <span className={`transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${isActive ? 'text-[#8B5CF6]' : 'text-white/30 group-hover:text-white/60'}`}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-[#6C3FF5] to-[#00D4FF] shadow-[0_0_8px_#6C3FF5]" />
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-[#6C3FF5]/10">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 font-outfit font-semibold text-xs hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 group transition-all duration-300"
                >
                    <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    )
}
