'use client'

import { PawPrint, ChevronRight, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from './ui/GlassCard'
import Link from 'next/link'
import { Pet } from '@/lib/types'

interface PetListProps {
  pets: Pet[]
}

export function PetList({ pets }: PetListProps) {
  return (
    <GlassCard className="!p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white font-outfit font-bold text-lg flex items-center gap-2">
          <PawPrint size={20} className="text-[#8B5CF6]" />
          Tu Familia Peludita
        </h2>
        <Link href="/dashboard/pets" className="text-[#A78BFA] text-xs font-bold hover:underline flex items-center gap-1 group">
          Gestionar <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pets.map((pet, i) => (
          <motion.div
            key={pet.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/dashboard/pets/${pet.id}`}>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-[#8B5CF6]/30 transition-all group">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#8B5CF6]/50 transition-colors bg-white/5 flex items-center justify-center shrink-0">
                  {pet.avatar_url ? (
                    <img src={pet.avatar_url} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl opacity-50">🐾</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-sm truncate">{pet.name}</h3>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-1">{pet.species}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
        <Link href="/dashboard/pets/new" className="flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-white/5 hover:border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/5 transition-all group">
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] group-hover:scale-110 transition-transform">
            <Plus size={20} />
          </div>
          <span className="text-white/40 font-bold text-sm">Añadir otro</span>
        </Link>
      </div>
    </GlassCard>
  )
}
