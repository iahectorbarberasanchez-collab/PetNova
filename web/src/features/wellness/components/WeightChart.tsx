import { motion } from 'framer-motion'
import { WeightEntry } from '@/core/entities/pet'

interface WeightChartProps {
    weightHistory: WeightEntry[]
}

export function WeightChart({ weightHistory }: WeightChartProps) {
    if (weightHistory.length < 2) return <div className="h-[200px] flex items-center justify-center text-[var(--text-dim)] text-sm">Añade al menos 2 registros para ver la tendencia.</div>
    
    const data = [...weightHistory].reverse()
    const maxWeight = Math.max(...data.map(d => d.weight_kg)) * 1.1
    const minWeight = Math.min(...data.map(d => d.weight_kg)) * 0.9
    const range = maxWeight - minWeight
    const width = 800; const height = 200
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - ((d.weight_kg - minWeight) / range) * height
    }))

    const pathD = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '')

    return (
        <div className="py-6">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[200px] overflow-visible">
                <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--secondary)" />
                    </linearGradient>
                </defs>
                <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" 
                />
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="6" className="fill-[var(--background)] stroke-[var(--primary-light)] stroke-[2px]" />
                ))}
            </svg>
            <div className="flex justify-between mt-4 opacity-30 text-[10px] font-bold uppercase tracking-wider">
                <span>{new Date(data[0].recorded_at).toLocaleDateString()}</span>
                <span className="text-[var(--primary)]">Evolución de Masa Corporal</span>
                <span>{new Date(data[data.length-1].recorded_at).toLocaleDateString()}</span>
            </div>
        </div>
    )
}
