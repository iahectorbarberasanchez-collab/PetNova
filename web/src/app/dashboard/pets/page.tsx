'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, PawPrint } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { PageHeader } from '@/components/ui/PageHeader'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { usePets } from '@/hooks/usePets'
import { PetCard } from '@/components/PetCard'
import { useUser } from '@/hooks/useUser'

export default function PetsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const { userId } = useUser()
    const { pets, loading, deletePet } = usePets(userId)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleDelete = async (petId: string, petName: string) => {
        if (!confirm(`¿Eliminar a ${petName}? Esta acción no se puede deshacer.`)) return
        await deletePet(petId)
    }

    const filteredPets = pets.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.breed && p.breed.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    if (!mounted) return null

    return (
        <div className="dashboard-container">
            <Sidebar />

            <main className="dashboard-main lg:ml-[260px] relative min-h-screen px-4 sm:px-6 lg:px-8 py-8">
                <div className="noise-overlay pointer-events-none" />
                
                <div className="relative z-10 max-w-7xl mx-auto">
                    <PageHeader
                        title="Mis Mascotas"
                        subtitle={loading ? 'Cargando tus compañeros...' : `${pets.length} ${pets.length === 1 ? 'mascota registrada' : 'mascotas registradas'}`}
                        emoji="🐾"
                        action={
                            <PremiumButton href="/dashboard/pets/new" icon={<Plus size={18} />}>
                                Añadir Mascota
                            </PremiumButton>
                        }
                    />

                    {/* Filters / Search */}
                    {!loading && pets.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-10"
                        >
                            <div className="relative max-w-md group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#8B5CF6] transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o raza..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-white/20 focus:outline-none focus:border-[#8B5CF6]/50 focus:bg-white/[0.05] transition-all font-outfit"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-80 rounded-[22px] bg-white/[0.03] border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && pets.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="rounded-[32px] max-w-md w-full p-12 flex flex-col items-center bg-white/[0.02] border border-white/5 backdrop-blur-xl">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 text-4xl bg-[#8B5CF6]/10 text-[#8B5CF6]">
                                    <PawPrint size={40} />
                                </div>
                                <h2 className="text-2xl font-outfit font-black text-white mb-4">¡Tu familia peludita te espera!</h2>
                                <p className="text-white/40 mb-8 text-sm leading-relaxed max-w-xs font-medium">
                                    Registra a tu compañero y empieza a llevar su cartilla médica, subir fotos y mucho más.
                                </p>
                                <PremiumButton href="/dashboard/pets/new" icon={<Plus size={18} />}>
                                    Registrar mi primera mascota
                                </PremiumButton>
                            </div>
                        </motion.div>
                    )}

                    {/* Pet Grid */}
                    {!loading && pets.length > 0 && (
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredPets.map(pet => (
                                    <PetCard
                                        key={pet.id}
                                        pet={pet as any}
                                        onDelete={handleDelete}
                                        isDeleting={false}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    )
}
