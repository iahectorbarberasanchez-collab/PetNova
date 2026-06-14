import { motion } from 'framer-motion'
import { BehaviorEntry, MOODS } from '@/core/entities/pet'

interface BehaviorListProps {
    behaviorHistory: BehaviorEntry[]
}

export function BehaviorList({ behaviorHistory }: BehaviorListProps) {
    return (
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
                            {log.notes && <p className="mt-4 text-sm text-[var(--text-dim)] font-medium leading-relaxed italic">&ldquo;{log.notes}&rdquo;</p>}
                        </div>
                    </motion.div>
                )
            })}
            {behaviorHistory.length === 0 && <p className="text-center py-10 text-[var(--text-dim)] font-bold italic opacity-40">Sin registros de comportamiento.</p>}
        </div>
    )
}
