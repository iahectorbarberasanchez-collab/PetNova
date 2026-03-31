'use client'

import { Calendar, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useHealthRecords } from '@/hooks/useHealthRecords'
import { GlassCard } from './ui/GlassCard'
import Link from 'next/link'

interface UpcomingEventsProps {
  userId?: string | null
}

export function UpcomingEvents({ userId }: UpcomingEventsProps) {
  // Enriqueceremos esto para que busque los registros de salud de todas las mascotas del usuario
  // Por ahora, asumimos que useHealthRecords sin petId trae los del usuario actual si la RLS lo permite
  const { records, loading } = useHealthRecords()

  const upcomingRecords = records
    .filter(r => r.next_due_date && new Date(r.next_due_date) >= new Date())
    .sort((a, b) => new Date(a.next_due_date!).getTime() - new Date(b.next_due_date!).getTime())
    .slice(0, 3)

  return (
    <GlassCard className="!p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white font-outfit font-bold text-sm flex items-center gap-2">
          <Calendar size={18} className="text-[#00D4FF]" />
          Agenda Próxima
        </h2>
        {upcomingRecords.length > 0 && (
          <Link href="/dashboard/health" className="text-[#00D4FF] text-[10px] font-bold uppercase tracking-widest hover:underline">
            Ver todo
          </Link>
        )}
      </div>

      <div className="space-y-4 flex-grow">
        {loading ? (
          <div className="space-y-3">
             {[1, 2].map(i => (
               <div key={i} className="h-16 rounded-xl bg-white/[0.02] animate-pulse" />
             ))}
          </div>
        ) : upcomingRecords.length > 0 ? (
          upcomingRecords.map((record, i) => (
            <motion.div 
              key={record.id}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-[#00D4FF]/10 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] text-[#00D4FF] font-bold uppercase leading-none">
                  {new Date(record.next_due_date!).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}
                </span>
                <span className="text-lg text-white font-bold leading-none">
                  {new Date(record.next_due_date!).getDate()}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-white text-xs font-bold truncate">{record.title}</h3>
                <p className="text-white/30 text-[10px] mt-0.5">{record.record_type}</p>
              </div>
              <ChevronRight size={14} className="ml-auto text-white/10 group-hover:text-[#00D4FF] transition-colors" />
            </motion.div>
          ))
        ) : (
          <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Calendar size={20} className="text-white/20" />
            </div>
            <p className="text-xs text-white/30 font-medium leading-relaxed">No hay citas pendientes para las próximas semanas</p>
          </div>
        )}
      </div>

      <button className="w-full mt-6 py-3 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] text-[11px] font-bold uppercase tracking-widest hover:bg-[#00D4FF]/20 transition-all">
        Gestionar Calendario
      </button>
    </GlassCard>
  )
}
