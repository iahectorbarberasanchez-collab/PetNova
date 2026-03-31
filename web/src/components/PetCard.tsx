'use client'

import { motion } from 'framer-motion'
import { PawPrint, Calendar, Weight, ChevronRight, Trash2 } from 'lucide-react'
import { Pet } from '@/lib/types'

interface PetCardProps {
  pet: Pet
  onDelete: (id: string, name: string) => void
  isDeleting: boolean
}

const SPECIES_ICONS: Record<string, any> = {
  Dog: PawPrint,
  Cat: PawPrint,
  Bird: PawPrint,
  Fish: PawPrint,
}

const SPECIES_COLOR: Record<string, string> = {
  Dog: '#F59E0B', Cat: '#8B5CF6', Bird: '#00D4FF', Fish: '#06B6D4',
  Rabbit: '#EC4899', Hamster: '#F97316', Reptile: '#10B981', Other: '#6C3FF5',
}

function calcAge(birthDate: string | null): string {
  if (!birthDate) return 'Edad desconocida'
  const birth = new Date(birthDate)
  const now = new Date()
  const total = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (total < 1) return 'Recién nacido'
  if (total < 12) return `${total} ${total === 1 ? 'mes' : 'meses'}`
  const y = Math.floor(total / 12)
  const m = total % 12
  return m > 0 ? `${y}a ${m}m` : `${y} ${y === 1 ? 'año' : 'años'}`
}

export function PetCard({ pet, onDelete, isDeleting }: PetCardProps) {
  const Icon = SPECIES_ICONS[pet.species] || PawPrint
  const color = SPECIES_COLOR[pet.species] || '#6C3FF5'

  return (
    <motion.div
      layout
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`rounded-[22px] overflow-hidden transition-all duration-300 group hover:translate-y-[-4px] ${isDeleting ? 'opacity-40 grayscale' : ''}`}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Card Hero */}
      <div className="relative overflow-hidden h-40">
        {pet.avatar_url ? (
          <img
            src={pet.avatar_url}
            alt={pet.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${color}20, ${color}08)` }}
          >
            <Icon size={56} style={{ color, opacity: 0.4 }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E1C]/90 via-transparent to-transparent" />
        
        {/* Species badge */}
        <div className="absolute top-3 right-3">
          <span
            className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-black backdrop-blur-md bg-black/40 border border-white/10"
            style={{ color }}
          >
            {pet.species}
          </span>
        </div>
        
        {/* Name / breed overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <h3 className="text-xl font-outfit font-bold text-white leading-tight drop-shadow-lg">{pet.name}</h3>
          {pet.breed && (
            <p className="text-white/50 text-[11px] font-bold uppercase tracking-tight truncate mt-0.5">{pet.breed}</p>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 pt-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl p-3.5 bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] group-hover:border-[#00D4FF]/20 transition-all">
            <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest mb-1.5 font-bold">
              <Calendar size={12} className="text-[#00D4FF]" /> Edad
            </div>
            <div className="font-outfit font-bold text-sm text-white/90">{calcAge(pet.birth_date)}</div>
          </div>
          <div className="rounded-2xl p-3.5 bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] group-hover:border-[#A78BFA]/20 transition-all">
            <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest mb-1.5 font-bold">
              <Weight size={12} className="text-[#A78BFA]" /> Peso
            </div>
            <div className="font-outfit font-bold text-sm text-white/90">{pet.weight_kg ? `${pet.weight_kg} kg` : '—'}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={`/dashboard/pets/${pet.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 text-white/80 text-[11px] font-black uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all border border-white/5"
          >
            Ver Perfil <ChevronRight size={14} />
          </a>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(pet.id, pet.name);
            }}
            disabled={isDeleting}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500/70 hover:bg-red-500/20 hover:text-red-500 transition-all border border-red-500/10 disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
