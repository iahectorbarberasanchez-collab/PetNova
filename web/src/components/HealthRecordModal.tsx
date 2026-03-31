'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Syringe, 
  Bug, 
  Stethoscope, 
  Pill, 
  Activity, 
  Scissors, 
  ClipboardList, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react'
import { GlassCard } from './ui/GlassCard'
import { PremiumButton } from './ui/PremiumButton'
import { Pet } from '@/lib/types'

interface HealthRecordModalProps {
  show: boolean
  onClose: () => void
  pets: Pet[]
  onSave: (record: any) => Promise<void>
}

const RECORD_TYPES = [
  { value: 'vaccine', label: 'Vacuna', icon: Syringe, color: '#6C3FF5' },
  { value: 'deworming', label: 'Desparasitación', icon: Bug, color: '#F97316' },
  { value: 'checkup', label: 'Revisión', icon: Stethoscope, color: '#00D4FF' },
  { value: 'medication', label: 'Medicación', icon: Pill, color: '#EC4899' },
  { value: 'surgery', label: 'Cirugía / Prueba', icon: Activity, color: '#EF4444' },
  { value: 'grooming', label: 'Peluquería', icon: Scissors, color: '#10B981' },
  { value: 'other', label: 'Otro', icon: ClipboardList, color: '#A78BFA' },
]

export function HealthRecordModal({ show, onClose, pets, onSave }: HealthRecordModalProps) {
  const [fPetId, setFPetId] = useState('')
  const [fType, setFType] = useState('vaccine')
  const [fTitle, setFTitle] = useState('')
  const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0])
  const [fNextDate, setFNextDate] = useState('')
  const [fNotes, setFNotes] = useState('')
  const [fSaving, setFSaving] = useState(false)
  const [fError, setFError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fPetId) { setFError('Selecciona una mascota.'); return }
    setFSaving(true); setFError(null)
    
    try {
      await onSave({
        pet_id: fPetId,
        record_type: fType,
        title: fTitle.trim(),
        date_administered: fDate,
        next_due_date: fNextDate || null,
        notes: fNotes.trim() || null,
      })
      onClose()
      setFTitle(''); setFType('vaccine'); setFNextDate(''); setFNotes('')
    } catch (error: any) {
      setFError(error.message)
    } finally {
      setFSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-xl z-5 relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary-light/50 rounded-[2.5rem] blur-2xl opacity-20" />
            <GlassCard className="p-8 border-primary/30 shadow-2xl overflow-visible relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary-light">
                    <Syringe size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-outfit">Nuevo Registro</h2>
                    <p className="text-white/40 text-sm">Añade información médica importante</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/30 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 px-1">Mascota *</label>
                    <div className="relative">
                      <select
                        value={fPetId}
                        onChange={e => setFPetId(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all appearance-none"
                      >
                        <option value="">Selecciona...</option>
                        {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 rotate-90" size={16} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 px-1">Tipo *</label>
                    <div className="relative">
                      <select
                        value={fType}
                        onChange={e => setFType(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all appearance-none"
                      >
                        {RECORD_TYPES.map(rt => (
                          <option key={rt.value} value={rt.value}>{rt.label}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 rotate-90" size={16} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 px-1">Título del Registro *</label>
                  <input
                    type="text"
                    placeholder="Ej: Vacuna Rabia 2025"
                    value={fTitle}
                    onChange={e => setFTitle(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 px-1">Fecha Realizado *</label>
                    <input
                      type="date"
                      value={fDate}
                      onChange={e => setFDate(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 px-1">Próxima Cita (Opcional)</label>
                    <input
                      type="date"
                      value={fNextDate}
                      onChange={e => setFNextDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 px-1">Notas u Observaciones</label>
                  <textarea
                    placeholder="Añade detalles sobre la dosis, centro veterinario o recomendaciones..."
                    value={fNotes}
                    onChange={e => setFNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all resize-none placeholder:text-white/10"
                  />
                </div>

                {fError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle size={16} /> {fError}
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <PremiumButton
                    className="flex-1 py-4 text-base font-bold shadow-[0_10px_20px_-5px_rgba(108,63,245,0.3)] group"
                    disabled={fSaving || !fTitle || !fPetId}
                    icon={<CheckCircle2 size={20} className={fSaving ? 'animate-spin' : 'group-hover:scale-110 transition-transform'} />}
                    type="submit"
                  >
                    {fSaving ? 'Guardando...' : 'Guardar en la Cartilla'}
                  </PremiumButton>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
