'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { Info, Leaf, Droplets, Thermometer, Box, Hash, LucideIcon, Users, Activity } from 'lucide-react'

// --- Constants & Options ---
const SPECIES_OPTIONS = [
    { value: 'Dog', label: '🐶', name: 'Perro', color: '#F59E0B' },
    { value: 'Cat', label: '🐱', name: 'Gato', color: '#8B5CF6' },
    { value: 'Bird', label: '🐦', name: 'Ave', color: '#00D4FF' },
    { value: 'Fish', label: '🐠', name: 'Pez', color: '#06B6D4' },
    { value: 'Rabbit', label: '🐇', name: 'Conejo', color: '#EC4899' },
    { value: 'Hamster', label: '🐹', name: 'Hámster', color: '#F97316' },
    { value: 'Reptile', label: '🦎', name: 'Reptil', color: '#10B981' },
    { value: 'Exotic', label: '🦄', name: 'Exótico', color: '#A78BFA' },
    { value: 'Other', label: '🐾', name: 'Otro', color: '#6C3FF5' },
]

interface AIResult {
    species?: string
    speciesKey?: string
    breed?: string
    confidence?: string
    characteristics?: string[]
    tips?: string
    error?: string
}

const CONFIDENCE_STYLE: Record<string, { color: string; bg: string; label: string }> = {
    'Alta': { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: '● Alta confianza' },
    'Media': { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: '◐ Confianza media' },
    'Baja': { color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)', label: '○ Baja confianza' },
}

export default function NewPetPage() {
    const supabase = createClient()
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Basic State
    const [name, setName] = useState('')
    const [species, setSpecies] = useState('')
    const [breed, setBreed] = useState('')
    const [birthDate, setBirthDate] = useState('')
    const [weightKg, setWeightKg] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Species Specific Data
    const [specificData, setSpecificData] = useState<Record<string, any>>({})
    const [habitatNotes, setHabitatNotes] = useState('')
    const [dietaryRequirements, setDietaryRequirements] = useState('')

    // AI state
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageBase64, setImageBase64] = useState<string | null>(null)
    const [imageMime, setImageMime] = useState<string>('image/jpeg')
    const [aiLoading, setAiLoading] = useState(false)
    const [aiResult, setAiResult] = useState<AIResult | null>(null)
    const [aiApplied, setAiApplied] = useState(false)
    const [dragOver, setDragOver] = useState(false)

    const processImageFile = (file: File) => {
        if (file.size > 4 * 1024 * 1024) {
            setError('La imagen es demasiado grande. Máximo 4 MB.')
            return
        }
        setError(null)
        setAiResult(null)
        setAiApplied(false)
        setImageMime(file.type || 'image/jpeg')

        const reader = new FileReader()
        reader.onload = (e) => {
            const result = e.target?.result as string
            setImagePreview(result)
            const base64 = result.split(',')[1]
            setImageBase64(base64)
        }
        reader.readAsDataURL(file)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) processImageFile(file)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) processImageFile(file)
    }

    const handleDetect = async () => {
        if (!imageBase64) return
        setAiLoading(true)
        setAiResult(null)
        setError(null)

        try {
            const res = await fetch('/api/detect-breed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64, mimeType: imageMime }),
            })
            const data: AIResult = await res.json()
            setAiResult(data)

            if (!data.error) {
                if (data.speciesKey) setSpecies(data.speciesKey)
                if (data.breed && data.breed !== 'Mestizo/a') setBreed(data.breed)
                setAiApplied(true)
            }
        } catch {
            setAiResult({ error: 'Error de red al conectar con la IA.' })
        } finally {
            setAiLoading(false)
        }
    }

    const clearImage = () => {
        setImagePreview(null)
        setImageBase64(null)
        setAiResult(null)
        setAiApplied(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!species) { setError('Por favor, selecciona el tipo de mascota.'); return }
        setLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth'); return }

        // 1. Insert Pet
        const { data: petData, error: insertError } = await supabase.from('pets').insert({
            owner_id: user.id,
            name: name.trim(),
            species,
            breed: breed.trim() || null,
            birth_date: birthDate || null,
            weight_kg: weightKg ? parseFloat(weightKg) : null,
        }).select().single()

        if (insertError) { setError(insertError.message); setLoading(false); return }

        // 2. Insert Species Specific Profile
        if (petData) {
            const { error: profileError } = await supabase.from('pet_species_profiles').insert({
                pet_id: petData.id,
                species_category: species.toLowerCase(),
                specific_data: specificData,
                habitat_notes: habitatNotes.trim() || null,
                dietary_requirements: dietaryRequirements.trim() || null
            })
            if (profileError) console.error("Error creating species profile:", profileError)
        }

        router.push('/dashboard/pets')
        router.refresh()
    }

    const updateSpecificData = (key: string, value: any) => {
        setSpecificData(prev => ({ ...prev, [key]: value }))
    }

    const selectedSpecies = SPECIES_OPTIONS.find(s => s.value === species)

    // --- Styles ---
    const inputStyle: React.CSSProperties = {
        width: '100%', boxSizing: 'border-box',
        background: 'rgba(18,18,32,0.9)',
        border: '1px solid rgba(108,63,244,0.15)',
        borderRadius: 14, padding: '14px 18px',
        fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
        color: '#F8F8FF', outline: 'none', transition: 'all 0.2s',
    }
    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.78rem', fontWeight: 700,
        color: 'rgba(248,248,255,0.4)', marginBottom: 8, letterSpacing: '0.04em',
    }

    const confStyle = aiResult?.confidence ? (CONFIDENCE_STYLE[aiResult.confidence] || CONFIDENCE_STYLE['Media']) : null

    // --- Render Helpers ---
    const renderSpecificField = (label: string, Icon: LucideIcon, key: string, placeholder: string, type: string = 'text') => (
        <div style={{ flex: 1 }}>
            <label style={labelStyle}>{label.toUpperCase()}</label>
            <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(248,248,255,0.2)' }}>
                    {Icon && <Icon size={16} />}
                </span>
                <input 
                    style={{ ...inputStyle, paddingLeft: 42 }} 
                    type={type} 
                    placeholder={placeholder} 
                    value={specificData[key] || ''} 
                    onChange={e => updateSpecificData(key, e.target.value)} 
                />
            </div>
        </div>
    )

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#07070F' }}>
            <Sidebar />

            <main className="dashboard-main" style={{ overflowY: 'auto', position: 'relative' }}>
                <div className="noise-overlay" />
                <div className="orb w-[600px] h-[600px] -top-80 -right-40 bg-[radial-gradient(circle,rgba(108,63,245,0.1)_0%,transparent_70%)]" />

                <div style={{ position: 'relative', zIndex: 1, padding: '0 20px 60px' }}>
                    <nav style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '30px 0 40px', fontSize: '0.85rem' }}>
                        <Link href="/dashboard" style={{ color: 'rgba(248,248,255,0.3)', textDecoration: 'none' }}>Dashboard</Link>
                        <span style={{ color: 'rgba(248,248,255,0.15)' }}>›</span>
                        <Link href="/dashboard/pets" style={{ color: 'rgba(248,248,255,0.3)', textDecoration: 'none' }}>Mis Mascotas</Link>
                        <span style={{ color: 'rgba(248,248,255,0.15)' }}>›</span>
                        <span style={{ color: '#A78BFA', fontWeight: 600 }}>Registro Adaptive</span>
                    </nav>

                    <div style={{ maxWidth: 720 }}>
                        <div style={{ marginBottom: 40 }}>
                            <div style={{ display: 'inline-flex', padding: '6px 14px', borderRadius: 100, background: 'rgba(108,63,245,0.1)', border: '1px solid rgba(108,63,245,0.2)', color: '#A78BFA', fontSize: '0.75rem', fontWeight: 700, marginBottom: 16 }}>
                                NUEVO SISTEMA MULTI-ESPECIE 1.0
                            </div>
                            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.4rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #FFF, rgba(255,255,255,0.6))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Registra a tu compañero
                            </h1>
                            <p style={{ color: 'rgba(248,248,255,0.45)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                                Nuestra IA adaptativa configurará la cartilla y cuidados ideales según la especie.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {/* --- Section: Identity & IA --- */}
                            <div style={{ background: 'rgba(13,13,25,0.6)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 28, padding: '40px' }}>
                                <div style={{ display: 'flex', gap: 40, alignItems: 'center', marginBottom: 40 }}>
                                    {/* AI Photo Area */}
                                    <div style={{ flexShrink: 0 }}>
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{
                                                width: 140, height: 140, borderRadius: 24, border: `2px dashed ${dragOver ? '#6C3FF5' : 'rgba(108,63,245,0.2)'}`,
                                                background: imagePreview ? 'none' : 'rgba(108,63,245,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'all 0.3s'
                                            }}
                                            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={handleDrop}
                                        >
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Pet" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ textAlign: 'center' }}>
                                                    <span style={{ fontSize: 32 }}>📸</span>
                                                    <div style={{ fontSize: '0.65rem', color: 'rgba(248,248,255,0.3)', marginTop: 4, fontWeight: 700 }}>SUBIR FOTO</div>
                                                </div>
                                            )}
                                        </div>
                                        {imagePreview && (
                                            <button type="button" onClick={handleDetect} disabled={aiLoading} style={{
                                                width: '100%', marginTop: 12, padding: '8px', borderRadius: 10, background: 'linear-gradient(135deg, #6C3FF5, #00D4FF)',
                                                border: 'none', color: 'white', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(108,63,245,0.3)'
                                            }}>
                                                {aiLoading ? '...' : '✨ ANALIZAR IA'}
                                            </button>
                                        )}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ marginBottom: 20 }}>
                                            <label style={labelStyle}>NOMBRE DE LA MASCOTA</label>
                                            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Rocket, Khaleesi..." required />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>RAZA / VARIEDAD</label>
                                            <input style={inputStyle} value={breed} onChange={e => setBreed(e.target.value)} placeholder="Ej: Labrador, Maine Coon..." />
                                        </div>
                                    </div>
                                </div>

                                {/* Species Grid */}
                                <div>
                                    <label style={labelStyle}>SELECCIONA ESPECIE</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 12 }}>
                                        {SPECIES_OPTIONS.map(opt => {
                                            const active = species === opt.value
                                            return (
                                                <button key={opt.value} type="button" onClick={() => setSpecies(opt.value)} style={{
                                                    padding: '16px 8px', borderRadius: 18, border: `2px solid ${active ? opt.color : 'rgba(255,255,255,0.03)'}`,
                                                    background: active ? `${opt.color}15` : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                                                }}>
                                                    <div style={{ fontSize: 24, marginBottom: 4 }}>{opt.label}</div>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: active ? opt.color : 'rgba(248,248,255,0.3)' }}>{opt.name}</div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* --- Section: Vital Stats --- */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                <div style={{ background: 'rgba(13,13,25,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '30px' }}>
                                    <label style={labelStyle}>FECHA DE NACIMIENTO</label>
                                    <input style={{ ...inputStyle, colorScheme: 'dark' }} type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
                                </div>
                                <div style={{ background: 'rgba(13,13,25,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '30px' }}>
                                    <label style={labelStyle}>PESO ACTUAL (KG)</label>
                                    <input style={inputStyle} type="number" step="0.1" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="Ej: 4.5" />
                                </div>
                            </div>

                            {/* --- Section: SPECIES SPECIFIC (ADAPTIVE) --- */}
                            {species && (
                                <div style={{ background: 'rgba(108,63,245,0.05)', border: '1px solid rgba(108,63,245,0.15)', borderRadius: 28, padding: '40px', animation: 'fadeIn 0.4s ease' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(108,63,245,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA' }}>
                                            <Box size={20} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, margin: 0, fontSize: '1.2rem' }}>Parámetros de {selectedSpecies?.name}</h3>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(248,248,255,0.35)' }}>Configura los detalles técnicos de su cuidado.</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                        {/* Dynamic Fields based on species */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                            {(species === 'Bird') && (
                                                <>
                                                    {renderSpecificField('Tipo de Jaula', Box, 'cage_type', 'Ej: Voladera, rectangular...')}
                                                    {renderSpecificField('Envergadura (cm)', Box, 'wingspan', '0', 'number')}
                                                </>
                                            )}
                                            {(species === 'Fish') && (
                                                <>
                                                    {renderSpecificField('pH del Agua', Droplets, 'water_ph', '7.0', 'number')}
                                                    {renderSpecificField('Temp. Ideal (°C)', Thermometer, 'ideal_temp', '24', 'number')}
                                                </>
                                            )}
                                            {(species === 'Reptile') && (
                                                <>
                                                    {renderSpecificField('Humedad (%)', Droplets, 'humidity', '60', 'number')}
                                                    {renderSpecificField('Tipo Iluminación', Leaf, 'lighting_type', 'Ej: UVB 5.0, Manto térmico...')}
                                                </>
                                            )}
                                            {(species === 'Rabbit' || species === 'Hamster') && (
                                                <>
                                                    {renderSpecificField('Material Lecho', Box, 'bedding_material', 'Ej: Papel, Madera...')}
                                                    {renderSpecificField('Heno Favorito', Leaf, 'favorite_hay', 'Ej: Timothy, Alfalfa...')}
                                                </>
                                            )}
                                            {renderSpecificField('Nivel de Actividad', Activity, 'activity_level', 'Bajo, Medio, Alto')}
                                            {renderSpecificField('Sociabilidad', Users, 'sociability', '1-10', 'number')}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                            <div>
                                                <label style={labelStyle}>NOTAS DEL HÁBITAT</label>
                                                <textarea 
                                                    style={{ ...inputStyle, height: 100, resize: 'none' }} 
                                                    placeholder="Describe su entorno, limpieza, accesorios..." 
                                                    value={habitatNotes} 
                                                    onChange={e => setHabitatNotes(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>DIETA Y REQUERIMIENTOS</label>
                                                <textarea 
                                                    style={{ ...inputStyle, height: 100, resize: 'none' }} 
                                                    placeholder="Listado de alimentos permitidos, prohibidos o suplementos..." 
                                                    value={dietaryRequirements} 
                                                    onChange={e => setDietaryRequirements(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 16, padding: '16px 20px', color: '#FF6B6B', fontSize: '0.9rem', display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <Info size={18} /> {error}
                                </div>
                            )}

                            {/* --- Actions --- */}
                            <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
                                <button type="submit" disabled={loading} style={{
                                    flex: 2, padding: '18px', borderRadius: 18, border: 'none', background: loading ? 'rgba(108,63,245,0.3)' : 'linear-gradient(135deg, #6C3FF5, #00D4FF)',
                                    color: 'white', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1rem', cursor: loading ? 'wait' : 'pointer', transition: 'all 0.3s', boxShadow: '0 8px 30px rgba(108,63,245,0.4)'
                                }}>
                                    {loading ? 'Sincronizando...' : 'GUARDAR MASCOTA ADAPTIVE'}
                                </button>
                                <Link href="/dashboard/pets" style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, color: 'rgba(248,248,255,0.4)', fontWeight: 700, fontSize: '0.95rem'
                                }}>
                                    CANCELAR
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                <style jsx>{`
                    .dashboard-main { flex: 1; min-width: 0; background-color: #07070F; transition: all 0.3s; padding-left: 260px; }
                    @media (max-width: 1024px) { .dashboard-main { padding-left: 0; } }
                    .noise-overlay { position: fixed; inset: 0; background-image: url('/noise.png'); opacity: 0.03; pointer-events: none; z-index: 0; }
                    .orb { position: absolute; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0; }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>
            </main>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    )
}
