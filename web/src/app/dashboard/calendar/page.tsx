'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Bell, Trash2, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- Types ---
interface CalendarEvent {
    id: string
    pet_id: string
    event_type: string
    title: string
    description: string | null
    start_time: string
    end_time: string | null
    is_completed: boolean
    pets?: { name: string; species: string }
}

interface Pet {
    id: string
    name: string
    species: string
}

export default function CalendarPage() {
    const supabase = createClient()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [pets, setPets] = useState<Pet[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    // Form state
    const [petId, setPetId] = useState('')
    const [title, setTitle] = useState('')
    const [type, setType] = useState('Feeding')
    const [startTime, setStartTime] = useState('')
    const [description, setDescription] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: petsData } = await supabase.from('pets').select('id, name, species').eq('owner_id', user.id)
        setPets(petsData || [])

        const { data: eventsData } = await supabase
            .from('care_calendar_events')
            .select('*, pets(name, species)')
            .order('start_time', { ascending: true })
        
        setEvents(eventsData || [])
        setLoading(false)
    }

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

    const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
    const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay()

    const renderHeader = () => {
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <div>
                    <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 900, margin: 0 }}>Calendario de Cuidados</h1>
                    <p style={{ margin: 0, opacity: 0.4, fontSize: '0.9rem' }}>Gestiona las tareas diarias de tus compañeros.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.03)', padding: '8px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><ChevronLeft /></button>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: 140, textAlign: 'center' }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                    <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><ChevronRight /></button>
                </div>
            </div>
        )
    }

    const renderDays = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const totalDays = daysInMonth(year, month)
        const startOffset = firstDayOfMonth(year, month)
        
        const dayNames = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"]
        const days = []

        // Week Headers
        dayNames.forEach(d => days.push(<div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, opacity: 0.3, paddingBottom: 15 }}>{d}</div>))

        // Empty slots
        for (let i = 0; i < startOffset; i++) days.push(<div key={`empty-${i}`} />)

        // Day slots
        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const dayEvents = events.filter(e => e.start_time.startsWith(dateStr))
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString()

            days.push(
                <div 
                    key={d} 
                    onClick={() => { setSelectedDate(new Date(year, month, d)); setShowModal(true); setStartTime(`${dateStr}T09:00`) }}
                    style={{
                        minHeight: 110, padding: 12, borderRadius: 16, background: isToday ? 'rgba(108,63,245,0.08)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isToday ? 'rgba(108,63,245,0.3)' : 'rgba(255,255,255,0.05)'}`, cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                    }}
                >
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, opacity: isToday ? 1 : 0.4 }}>{d}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                        {dayEvents.map(e => (
                            <div key={e.id} style={{ fontSize: '0.65rem', padding: '4px 8px', borderRadius: 6, background: e.is_completed ? 'rgba(16,185,129,0.1)' : 'rgba(108,63,245,0.15)', color: e.is_completed ? '#10B981' : '#A78BFA', fontWeight: 700, borderLeft: `3px solid ${e.is_completed ? '#10B981' : '#6C3FF5'}`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {e.pets?.name}: {e.title}
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>{days}</div>
    }

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!petId || !title || !startTime) return
        
        setSaving(true)
        const { error } = await supabase.from('care_calendar_events').insert({
            pet_id: petId,
            title,
            event_type: type,
            start_time: startTime,
            description: description || null
        })

        if (!error) {
            fetchData()
            setShowModal(false)
            setPetId(''); setTitle(''); setStartTime(''); setDescription('')
        }
        setSaving(false)
    }

    const updateEventStatus = async (id: string, status: boolean) => {
        await supabase.from('care_calendar_events').update({ is_completed: status }).eq('id', id)
        fetchData()
    }

    const deleteEvent = async (id: string) => {
        if (!confirm('¿Eliminar evento?')) return
        await supabase.from('care_calendar_events').delete().eq('id', id)
        fetchData()
    }

    const [saving, setSaving] = useState(false)

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#07070F' }}>
            <Sidebar />

            <main className="dashboard-main" style={{ overflowY: 'auto' }}>
                <div className="noise-overlay" />

                <div style={{ padding: 48, maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    {renderHeader()}

                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 40 }}>
                        {/* Calendar Grid */}
                        <div>
                            {renderDays()}
                        </div>

                        {/* Summary List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div style={{ background: 'rgba(13,13,25,0.6)', borderRadius: 28, border: '1px solid rgba(255,255,255,0.05)', padding: 30 }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 24px', fontSize: '1.1rem', fontWeight: 800 }}><Clock size={20} color="#A78BFA" /> Tareas Pendientes</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {events.filter(e => !e.is_completed).slice(0, 5).map(e => (
                                        <div key={e.id} style={{ display: 'flex', gap: 14, padding: 16, borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <div onClick={() => updateEventStatus(e.id, true)} style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid rgba(108,63,245,0.3)', cursor: 'pointer', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{e.title}</div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.4 }}>{new Date(e.start_time).toLocaleDateString()} • {e.pets?.name}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {events.filter(e => !e.is_completed).length === 0 && <p style={{ opacity: 0.3, fontSize: '0.8rem', textAlign: 'center' }}>Nada pendiente 🎉</p>}
                                </div>
                            </div>

                            <button onClick={() => setShowModal(true)} style={{ padding: '18px', borderRadius: 18, background: 'linear-gradient(135deg, #6C3FF5, #00D4FF)', border: 'none', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <Plus size={18} /> NUEVO RECORDATORIO
                            </button>
                        </div>
                    </div>
                </div>

                {/* MODAL */}
                <AnimatePresence>
                    {showModal && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ width: 450, background: '#0D0D1A', borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)', padding: 40 }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 24 }}>Nuevo Evento</h2>
                                <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', opacity: 0.4, fontWeight: 800, marginBottom: 8, display: 'block' }}>MASCOTA</label>
                                        <select style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} value={petId} onChange={e => setPetId(e.target.value)} required>
                                            <option value="">Seleccionar...</option>
                                            {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', opacity: 0.4, fontWeight: 800, marginBottom: 8, display: 'block' }}>TÍTULO</label>
                                        <input style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Vacuna Rabia" required />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.4, fontWeight: 800, marginBottom: 8, display: 'block' }}>TIPO</label>
                                            <select style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} value={type} onChange={e => setType(e.target.value)}>
                                                <option value="Feeding">Alimentación</option>
                                                <option value="Cleaning">Limpieza</option>
                                                <option value="Health">Salud</option>
                                                <option value="Medication">Medicamento</option>
                                                <option value="Exercise">Ejercicio</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.4, fontWeight: 800, marginBottom: 8, display: 'block' }}>FECHA Y HORA</label>
                                            <input type="datetime-local" style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', colorScheme: 'dark' }} value={startTime} onChange={e => setStartTime(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                                        <button type="submit" disabled={saving} style={{ flex: 2, padding: '16px', borderRadius: 16, background: '#6C3FF5', border: 'none', color: 'white', fontWeight: 800, cursor: 'pointer' }}>{saving ? 'Guardando...' : 'CREAR EVENTO'}</button>
                                        <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '16px', borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>CANCELAR</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <style jsx>{`
                    .dashboard-main { flex: 1; min-width: 0; background-color: #07070F; transition: all 0.3s; padding-left: 260px; position: relative; }
                    @media (max-width: 1024px) { .dashboard-main { padding-left: 0; } }
                    .noise-overlay { position: absolute; inset: 0; background-image: url('/noise.png'); opacity: 0.02; pointer-events: none; z-index: 0; }
                `}</style>
            </main>
        </div>
    )
}
