'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'
import { Utensils, Zap, Plus, Trash2, Calendar, Coffee, Sun, Moon, Star, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- Types ---
interface FoodLog {
    id: string; pet_id: string; food_name: string; meal_time: string; amount_grams: number | null; calories: number | null; food_type: string; recorded_at: string
}
interface Pet {
    id: string; name: string; species: string
}

const MEAL_TIMES = [
    { label: 'Desayuno', value: 'Breakfast', icon: Coffee, color: '#F59E0B' },
    { label: 'Almuerzo', value: 'Lunch', icon: Sun, color: '#FCD34D' },
    { label: 'Cena', value: 'Dinner', icon: Moon, color: '#6366F1' },
    { label: 'Premio/Snack', value: 'Snack', icon: Star, color: '#EC4899' },
]

export default function NutritionPage() {
    const supabase = createClient()
    const [pets, setPets] = useState<Pet[]>([])
    const [selectedPetId, setSelectedPetId] = useState<string>('')
    const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    // Form inputs
    const [foodName, setFoodName] = useState('')
    const [mealTime, setMealTime] = useState('Breakfast')
    const [amount, setAmount] = useState('')
    const [calories, setCalories] = useState('')
    const [foodType, setFoodType] = useState('Dry')

    useEffect(() => {
        fetchInitial()
    }, [])

    useEffect(() => {
        if (selectedPetId) fetchPetLogs(selectedPetId)
    }, [selectedPetId])

    const fetchInitial = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: petsData } = await supabase.from('pets').select('id, name, species').eq('owner_id', user.id)
        if (petsData && petsData.length > 0) {
            setPets(petsData)
            setSelectedPetId(petsData[0].id)
        }
        setLoading(false)
    }

    const fetchPetLogs = async (petId: string) => {
        const today = new Date().toISOString().split('T')[0]
        const { data } = await supabase.from('pet_nutrition_logs')
            .select('*')
            .eq('pet_id', petId)
            // Show today's logs by default, or last few days
            .order('recorded_at', { ascending: false })
            .limit(20)
        setFoodLogs(data || [])
    }

    const handleAddLog = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPetId || !foodName) return
        
        const { error } = await supabase.from('pet_nutrition_logs').insert({
            pet_id: selectedPetId,
            food_name: foodName,
            meal_time: mealTime,
            amount_grams: amount ? parseFloat(amount) : null,
            calories: calories ? parseFloat(calories) : null,
            food_type: foodType
        })

        if (!error) {
            fetchPetLogs(selectedPetId)
            setShowModal(false)
            setFoodName(''); setAmount(''); setCalories('')
        }
    }

    const deleteLog = async (id: string) => {
        if (!confirm('¿Eliminar registro?')) return
        await supabase.from('pet_nutrition_logs').delete().eq('id', id)
        fetchPetLogs(selectedPetId)
    }

    const totalKcalToday = foodLogs.reduce((acc, log) => acc + (log.calories || 0), 0)

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#07070F' }}>
            <Sidebar />
            <main className="dashboard-main" style={{ overflowY: 'auto' }}>
                <div className="noise-overlay" />
                <div style={{ padding: 48, maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                        <div>
                            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 900, margin: 0, background: 'linear-gradient(to right, #FFF, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Diario de Nutrición</h1>
                            <p style={{ margin: 0, opacity: 0.4, fontSize: '1rem' }}>Sigue cada comida y mantén su dieta bajo control.</p>
                        </div>
                        <select style={{ padding: '14px 24px', borderRadius: 16, background: '#121220', border: '1px solid rgba(0,212,255,0.2)', color: 'white', fontWeight: 700 }} value={selectedPetId} onChange={e => setSelectedPetId(e.target.value)}>
                            {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40, alignItems: 'start' }}>
                        {/* --- Main Feed --- */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontWeight: 800 }}>Registros Recientes</h3>
                                <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg, #00D4FF, #6C3FF5)', border: 'none', color: 'white', padding: '12px 24px', borderRadius: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Plus size={18} /> REGISTRAR COMIDA
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {foodLogs.map(log => {
                                    const time = MEAL_TIMES.find(t => t.value === log.meal_time) || MEAL_TIMES[0]
                                    const Icon = time.icon
                                    return (
                                        <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 24, borderRadius: 24, background: 'rgba(13,13,25,0.6)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${time.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: time.color }}><Icon size={24} /></div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>{log.food_name}</span>
                                                    <span style={{ fontSize: '0.8rem', opacity: 0.3 }}>{new Date(log.recorded_at).toLocaleDateString()}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: '0.85rem', color: 'rgba(248,248,255,0.4)' }}>
                                                    <span>⏰ {time.label}</span>
                                                    {log.amount_grams && <span>⚖️ {log.amount_grams}g</span>}
                                                    {log.calories && <span>🔥 {log.calories} kcal</span>}
                                                    <span>📦 {log.food_type}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => deleteLog(log.id)} style={{ padding: 10, borderRadius: 10, background: 'rgba(239,68,68,0.05)', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                    )
                                })}
                                {foodLogs.length === 0 && <div style={{ textAlign: 'center', padding: '60px 40px', borderRadius: 28, background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)', opacity: 0.3 }}><Utensils size={40} style={{ marginBottom: 12 }} /> <p>Aún no has registrado ninguna comida hoy.</p></div>}
                            </div>
                        </div>

                        {/* --- Stats Sidebar --- */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 28, padding: 30, textAlign: 'center' }}>
                                <div style={{ width: 60, height: 60, borderRadius: 20, background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00D4FF', margin: '0 auto 20px' }}><Zap size={28} /></div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{totalKcalToday}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.4, letterSpacing: '0.05em' }}>KCAL HOY</div>
                            </div>

                            <div style={{ background: 'rgba(13,13,25,0.6)', borderRadius: 28, border: '1px solid rgba(255,255,255,0.05)', padding: 30 }}>
                                <h4 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}><Info size={18} color="#00D4FF" /> Resumen Nutricional</h4>
                                <div style={{ fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.5 }}>
                                    La alimentación balanceada previene enfermedades metabólicas. Asegúrate de registrar también el agua consumida en "Notas de Hábitat".
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL */}
                <AnimatePresence>
                    {showModal && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ width: 450, background: '#0D0D1A', borderRadius: 32, padding: 40, border: '1px solid rgba(255,255,255,0.1)' }}>
                                <h3 style={{ marginBottom: 24, fontSize: '1.4rem' }}>Log de Nutrición</h3>
                                <form onSubmit={handleAddLog} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div><label style={{ fontSize: '0.75rem', opacity: 0.4, marginBottom: 8, display: 'block' }}>COMIDA / PRODUCTO</label><input style={{ width: '100%', boxSizing: 'border-box', padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} value={foodName} onChange={e => setFoodName(e.target.value)} placeholder="Ej: Royal Canin Mini Adult" required /></div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <div><label style={{ fontSize: '0.75rem', opacity: 0.4, marginBottom: 8, display: 'block' }}>MOMENTO</label><select style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} value={mealTime} onChange={e => setMealTime(e.target.value)}>{MEAL_TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                                        <div><label style={{ fontSize: '0.75rem', opacity: 0.4, marginBottom: 8, display: 'block' }}>TIPO</label><select style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} value={foodType} onChange={e => setFoodType(e.target.value)}><option value="Dry">Seco / Pienso</option><option value="Wet">Húmedo / Lata</option><option value="Raw">Natural / Raw</option><option value="Snack">Snack</option></select></div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <div><label style={{ fontSize: '0.75rem', opacity: 0.4, marginBottom: 8, display: 'block' }}>CANTIDAD (g/ml)</label><input type="number" style={{ width: '100%', boxSizing: 'border-box', padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} value={amount} onChange={e => setAmount(e.target.value)} /></div>
                                        <div><label style={{ fontSize: '0.75rem', opacity: 0.4, marginBottom: 8, display: 'block' }}>CALORÍAS (kcal)</label><input type="number" style={{ width: '100%', boxSizing: 'border-box', padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} value={calories} onChange={e => setCalories(e.target.value)} /></div>
                                    </div>
                                    <button type="submit" style={{ padding: 16, borderRadius: 14, background: '#00D4FF', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', marginTop: 10 }}>GUARDAR LOG</button>
                                    <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>Cancelar</button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <style jsx>{`
                    .dashboard-main { flex: 1; min-width: 0; background-color: #07070F; transition: all 0.3s; padding-left: 260px; position: relative; }
                    @media (max-width: 1024px) { .dashboard-main { padding-left: 0; } }
                    /* .noise-overlay uses the global SVG pattern from globals.css */
                `}</style>
            </main>
        </div>
    )
}
