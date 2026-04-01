'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'
import { Heart, Calendar, Plus, Trash2, Info, Star, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- Types ---
interface BreedingLog {
    id: string; pet_id: string; cycle_start: string; cycle_end: string | null; Notes: string | null; status: string; recorded_at: string
}
interface Pet {
    id: string; name: string; species: string; wants_to_breed: boolean
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    'Heat': { label: 'En Celo', color: '#EC4899' },
    'Mated': { label: 'Cruzado/a', color: '#F59E0B' },
    'Pregnant': { label: 'Gestante', color: '#8B5CF6' },
    'Nursing': { label: 'Lactancia', color: '#10B981' },
    'Resting': { label: 'Reposo', color: '#6B7280' },
}

export default function BreedingPage() {
    const supabase = createClient()
    const [pets, setPets] = useState<Pet[]>([])
    const [selectedPetId, setSelectedPetId] = useState<string>('')
    const [breedingLogs, setBreedingLogs] = useState<BreedingLog[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    // Form inputs
    const [cycleStart, setCycleStart] = useState('')
    const [status, setStatus] = useState('Heat')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        fetchInitial()
    }, [])

    useEffect(() => {
        if (selectedPetId) fetchBreedingLogs(selectedPetId)
    }, [selectedPetId])

    const fetchInitial = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: petsData } = await supabase.from('pets').select('id, name, species, wants_to_breed').eq('owner_id', user.id)
        if (petsData && petsData.length > 0) {
            setPets(petsData)
            setSelectedPetId(petsData[0].id)
        }
        setLoading(false)
    }

    const fetchBreedingLogs = async (petId: string) => {
        const { data } = await supabase.from('pet_breeding_logs')
            .select('*')
            .eq('pet_id', petId)
            .order('cycle_start', { ascending: false })
        setBreedingLogs(data || [])
    }

    const toggleWantsToBreed = async (id: string, current: boolean) => {
        const { error } = await supabase.from('pets').update({ wants_to_breed: !current }).eq('id', id)
        if (!error) {
            setPets(prev => prev.map(p => p.id === id ? { ...p, wants_to_breed: !current } : p))
        }
    }

    const handleAddLog = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPetId || !cycleStart) return
        const { error } = await supabase.from('pet_breeding_logs').insert({
            pet_id: selectedPetId,
            cycle_start: cycleStart,
            status,
            notes: notes || null
        })
        if (!error) {
            fetchBreedingLogs(selectedPetId)
            setShowModal(false)
            setCycleStart(''); setNotes('')
        }
    }

    const deleteLog = async (id: string) => {
        if (!confirm('¿Eliminar registro?')) return
        await supabase.from('pet_breeding_logs').delete().eq('id', id)
        fetchBreedingLogs(selectedPetId)
    }

    const selectedPet = pets.find(p => p.id === selectedPetId)

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#07070F' }}>
            <Sidebar />
            <main className="dashboard-main" style={{ overflowY: 'auto' }}>
                <div className="noise-overlay" />
                <div style={{ padding: 48, maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                        <div>
                            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 900, margin: 0, background: 'linear-gradient(to right, #FFF, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Gestión de Cría</h1>
                            <p style={{ margin: 0, opacity: 0.4, fontSize: '1rem' }}>Control ético y seguimiento de ciclos reproductivos.</p>
                        </div>
                        <select style={{ padding: '14px 24px', borderRadius: 16, background: '#121220', border: '1px solid rgba(236,72,153,0.2)', color: 'white', fontWeight: 700 }} value={selectedPetId} onChange={e => setSelectedPetId(e.target.value)}>
                            {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
                        {/* --- Breeding Status & Controls --- */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div style={{ background: 'rgba(13,13,25,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 28, padding: 32 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899' }}><Heart size={20} /></div>
                                        <h3 style={{ margin: 0, fontWeight: 800 }}>Disponibilidad</h3>
                                    </div>
                                    <button 
                                        onClick={() => selectedPet && toggleWantsToBreed(selectedPet.id, selectedPet.wants_to_breed)}
                                        style={{ 
                                            padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                            background: selectedPet?.wants_to_breed ? 'linear-gradient(135deg, #EC4899, #8B5CF6)' : 'rgba(255,255,255,0.03)',
                                            color: selectedPet?.wants_to_breed ? 'white' : 'rgba(248,248,255,0.3)',
                                            fontWeight: 800, fontSize: '0.75rem', transition: 'all 0.3s'
                                        }}
                                    >
                                        {selectedPet?.wants_to_breed ? 'ACTIVO PARA CRÍA' : 'NO DISPONIBLE'}
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'rgba(248,248,255,0.4)', lineHeight: 1.6 }}>
                                    Al habilitar la cría, {selectedPet?.name} aparecerá en el buscador para conectar con otros criadores éticos autorizados.
                                </p>
                            </div>

                            <div style={{ background: 'rgba(13,13,25,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 28, padding: 32 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <h3 style={{ margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={18} color="#EC4899" /> Registro de Ciclos</h3>
                                    <button onClick={() => setShowModal(true)} style={{ background: 'rgba(236,72,153,0.1)', color: '#EC4899', border: '1px solid rgba(236,72,153,0.2)', padding: '10px 20px', borderRadius: 12, fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}>+ REGISTRAR</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {breedingLogs.map(log => {
                                        const statusObj = STATUS_MAP[log.status] || STATUS_MAP['Resting']
                                        return (
                                            <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusObj.color }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{statusObj.label}</span>
                                                        <span style={{ fontSize: '0.7rem', opacity: 0.3 }}>{new Date(log.cycle_start).toLocaleDateString()}</span>
                                                    </div>
                                                    {log.Notes && <p style={{ margin: '4px 0 0', fontSize: '0.75rem', opacity: 0.4 }}>{log.Notes}</p>}
                                                </div>
                                                <button onClick={() => deleteLog(log.id)} style={{ padding: 8, background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                            </div>
                                        )
                                    })}
                                    {breedingLogs.length === 0 && <p style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.2, padding: 20 }}>No hay ciclos registrados.</p>}
                                </div>
                            </div>
                        </div>

                        {/* --- Tips & Ethics --- */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div style={{ background: 'rgba(236,72,153,0.05)', border: '1px solid rgba(236,72,153,0.15)', borderRadius: 28, padding: 32 }}>
                                <h4 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10, color: '#EC4899' }}><ShieldAlert size={18} /> Protocolo Ético</h4>
                                <ul style={{ margin: 0, padding: '0 0 0 20px', fontSize: '0.85rem', opacity: 0.5, lineHeight: 1.8 }}>
                                    <li>Evita la consanguinidad.</li>
                                    <li>Revisiones veterinarias pre-cruce obligatorias.</li>
                                    <li>Asegura un hogar responsable para cada cría.</li>
                                    <li>No cruzar hembras menores de 18 meses o mayores de 5 años (según especie).</li>
                                </ul>
                            </div>

                            <div style={{ background: 'rgba(13,13,25,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 28, padding: 32 }}>
                                <h4 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}><Star size={18} color="#F59E0B" /> Próximos Pasos</h4>
                                <p style={{ fontSize: '0.8rem', opacity: 0.4, margin: '0 0 16px' }}>En la próxima versión podrás generar certificados genealógicos IA verificados por la red PetNova.</p>
                                <div style={{ padding: '12px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', color: 'rgba(248,248,255,0.2)', fontSize: '0.7rem', fontWeight: 800 }}>PRÓXIMAMENTE: RED DE CRIADORES</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL */}
                <AnimatePresence>
                    {showModal && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ width: 450, background: '#0D0D1A', borderRadius: 32, padding: 40, border: '1px solid rgba(255,255,255,0.1)' }}>
                                <h3 style={{ marginBottom: 24, fontSize: '1.4rem' }}>Registrar Ciclo/Evento</h3>
                                <form onSubmit={handleAddLog} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div><label style={{ fontSize: '0.75rem', opacity: 0.4, marginBottom: 8, display: 'block' }}>FECHA DE INICIO</label><input type="date" style={{ width: '100%', boxSizing: 'border-box', padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', colorScheme: 'dark' }} value={cycleStart} onChange={e => setCycleStart(e.target.value)} required /></div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', opacity: 0.4, marginBottom: 8, display: 'block' }}>ESTADO ACTUAL</label>
                                        <select style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} value={status} onChange={e => setStatus(e.target.value)}>
                                            {Object.entries(STATUS_MAP).map(([val, { label }]) => <option key={val} value={val}>{label}</option>)}
                                        </select>
                                    </div>
                                    <div><label style={{ fontSize: '0.75rem', opacity: 0.4, marginBottom: 8, display: 'block' }}>NOTAS</label><textarea style={{ width: '100%', padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', height: 80 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Resultados de ecografía, fecha prevista parto..." /></div>
                                    <button type="submit" style={{ padding: 16, borderRadius: 14, background: '#EC4899', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer' }}>GUARDAR REGISTRO</button>
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
