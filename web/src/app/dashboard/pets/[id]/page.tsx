'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { Info, Leaf, Droplets, Thermometer, Box, Activity, Users, Settings, Heart, Shield } from 'lucide-react'

// --- Constants ---
const SPECIES_EMOJI: Record<string, string> = {
    Dog: '🐶', Cat: '🐱', Bird: '🐦', Fish: '🐠',
    Rabbit: '🐇', Hamster: '🐹', Reptile: '🦎', Exotic: '🦄', Other: '🐾',
}
const SPECIES_COLOR: Record<string, string> = {
    Dog: '#F59E0B', Cat: '#8B5CF6', Bird: '#00D4FF', Fish: '#06B6D4',
    Rabbit: '#EC4899', Hamster: '#F97316', Reptile: '#10B981', Exotic: '#A78BFA', Other: '#6C3FF5',
}

interface Pet {
    id: string; name: string; species: string; breed: string | null
    birth_date: string | null; weight_kg: number | null
    avatar_url: string | null; created_at: string; wants_to_breed: boolean
}

interface PetSpeciesProfile {
    id: string; pet_id: string; species_category: string
    specific_data: Record<string, any>; habitat_notes: string | null
    dietary_requirements: string | null
}

interface PetPhoto {
    id: string; photo_url: string; created_at: string
}

function calcAge(birthDate: string | null): string {
    if (!birthDate) return 'Desconocida'
    const birth = new Date(birthDate)
    const now = new Date()
    const total = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    if (total < 1) return 'Recién nacido'
    if (total < 12) return `${total} ${total === 1 ? 'mes' : 'meses'}`
    const y = Math.floor(total / 12); const m = total % 12
    return m > 0 ? `${y}a ${m}m` : `${y} ${y === 1 ? 'año' : 'años'}`
}

export default function PetDetailPage() {
    const supabase = createClient()
    const router = useRouter()
    const params = useParams()
    const petId = params.id as string
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [pet, setPet] = useState<Pet | null>(null)
    const [profile, setProfile] = useState<PetSpeciesProfile | null>(null)
    const [petPhotos, setPetPhotos] = useState<PetPhoto[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Photo upload state
    const [uploadingPhoto, setUploadingPhoto] = useState(false)
    const [avatarKey, setAvatarKey] = useState(Date.now())

    // Edit state (Basic)
    const [editName, setEditName] = useState('')
    const [editSpecies, setEditSpecies] = useState('')
    const [editBreed, setEditBreed] = useState('')
    const [editBirth, setEditBirth] = useState('')
    const [editWeight, setEditWeight] = useState('')
    const [editWantsToBreed, setEditWantsToBreed] = useState(false)

    // Edit state (Species Profile)
    const [editSpecificData, setEditSpecificData] = useState<Record<string, any>>({})
    const [editHabitat, setEditHabitat] = useState('')
    const [editDiet, setEditDiet] = useState('')

    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) { router.push('/auth'); return }
            setUserId(user.id)
            loadPetAll()
        })
    }, [petId])

    const loadPetAll = async () => {
        setLoading(true)
        const { data: petData, error: petErr } = await supabase.from('pets').select('*').eq('id', petId).single()
        if (petErr || !petData) { router.push('/dashboard/pets'); return }
        
        const { data: profileData } = await supabase.from('pet_species_profiles').select('*').eq('pet_id', petId).single()
        const { data: photos } = await supabase.from('pet_photos').select('*').eq('pet_id', petId).order('created_at', { ascending: true })
        
        setPet(petData)
        setProfile(profileData || null)
        setPetPhotos(photos || [])

        // Sync edit state
        setEditName(petData.name)
        setEditSpecies(petData.species)
        setEditBreed(petData.breed || '')
        setEditBirth(petData.birth_date || '')
        setEditWeight(petData.weight_kg?.toString() || '')
        setEditWantsToBreed(petData.wants_to_breed || false)

        if (profileData) {
            setEditSpecificData(profileData.specific_data || {})
            setEditHabitat(profileData.habitat_notes || '')
            setEditDiet(profileData.dietary_requirements || '')
        }

        setLoading(false)
    }

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !userId) return
        setUploadingPhoto(true)
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${userId}/${petId}/avatar.${ext}`

        if (pet?.avatar_url) {
            const oldPath = pet.avatar_url.split('/pet-photos/')[1]
            if (oldPath) await supabase.storage.from('pet-photos').remove([oldPath])
        }

        const { error: upErr } = await supabase.storage.from('pet-photos').upload(path, file, { upsert: true, contentType: file.type })
        if (upErr) { alert(upErr.message); setUploadingPhoto(false); return }

        const { data: { publicUrl } } = supabase.storage.from('pet-photos').getPublicUrl(path)
        await supabase.from('pets').update({ avatar_url: publicUrl }).eq('id', petId)

        setPet(prev => prev ? { ...prev, avatar_url: publicUrl } : prev)
        setAvatarKey(Date.now())
        setUploadingPhoto(false)
    }

    const handleSaveAll = async () => {
        if (!editName.trim()) return
        setSaving(true); setError(null)

        const { data: upPet, error: errPet } = await supabase.from('pets').update({
            name: editName.trim(),
            species: editSpecies,
            breed: editBreed.trim() || null,
            birth_date: editBirth || null,
            weight_kg: editWeight ? parseFloat(editWeight) : null,
            wants_to_breed: editWantsToBreed,
        }).eq('id', petId).select().single()

        if (errPet) { setError(errPet.message); setSaving(false); return }

        const profileToSave = {
            pet_id: petId,
            species_category: editSpecies.toLowerCase(),
            specific_data: editSpecificData,
            habitat_notes: editHabitat.trim() || null,
            dietary_requirements: editDiet.trim() || null
        }

        if (profile) {
            await supabase.from('pet_species_profiles').update(profileToSave).eq('id', profile.id)
        } else {
            await supabase.from('pet_species_profiles').insert(profileToSave)
        }

        setEditing(false)
        setSaving(false)
        loadPetAll()
    }

    const handleDelete = async () => {
        if (!confirm(`¿Eliminar a ${pet?.name}?`)) return
        setDeleting(true)
        await supabase.from('pets').delete().eq('id', petId)
        router.push('/dashboard/pets')
    }

    const color = SPECIES_COLOR[pet?.species] || '#6C3FF5'
    const emoji = SPECIES_EMOJI[pet?.species] || '🐾'

    const inputStyle: React.CSSProperties = {
        width: '100%', boxSizing: 'border-box',
        background: 'rgba(18,18,32,0.9)', border: '1px solid rgba(108,63,245,0.2)',
        borderRadius: 12, padding: '12px 16px', color: '#F8F8FF', outline: 'none',
    }

    if (loading) return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#07070F' }}>
            <Sidebar />
            <main className="dashboard-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 40, animation: 'pulse 1.5s infinite' }}>🐾</span>
            </main>
        </div>
    )

    if (!pet) return null

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#07070F' }}>
            <Sidebar />

            <main className="dashboard-main" style={{ overflowY: 'auto' }}>
                <div className="noise-overlay" />
                
                <div style={{ background: `linear-gradient(to bottom, ${color}15, transparent), #0D0D1A`, borderBottom: '1px solid rgba(255,255,255,0.03)', padding: '60px 48px 40px' }}>
                    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div onClick={() => !uploadingPhoto && fileInputRef.current?.click()} style={{ width: 140, height: 140, borderRadius: 32, border: `3px solid ${color}`, boxShadow: `0 0 40px ${color}25`, cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
                            {pet.avatar_url ? <img src={pet.avatar_url} key={avatarKey} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, background: 'rgba(255,255,255,0.03)' }}>{emoji}</div>}
                            {uploadingPhoto && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏳</div>}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8 }}>
                                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.8rem', fontWeight: 900, margin: 0 }}>{pet.name}</h1>
                                <span style={{ padding: '6px 16px', borderRadius: 100, background: `${color}15`, border: `1px solid ${color}30`, color, fontSize: '0.85rem', fontWeight: 800 }}>{emoji} {pet.species.toUpperCase()}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 24, color: 'rgba(248,248,255,0.4)', fontSize: '0.95rem', fontWeight: 600 }}>
                                <span>🏷️ {pet.breed || 'Sin raza'}</span>
                                <span>🎂 {calcAge(pet.birth_date)}</span>
                                {pet.weight_kg && <span>⚖️ {pet.weight_kg} kg</span>}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setEditing(!editing)} style={{ padding: '12px 24px', borderRadius: 14, background: editing ? '#F8F8FF' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: editing ? '#000' : '#F8F8FF', fontWeight: 800, cursor: 'pointer' }}>{editing ? 'CANCELAR' : 'EDITAR PERFIL'}</button>
                            <button onClick={handleDelete} style={{ padding: '12px', borderRadius: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', cursor: 'pointer' }}><Shield size={20} /></button>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '48px', maxWidth: 1100 }}>
                    {editing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 28, padding: '40px' }}>
                                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, marginBottom: 24 }}>General Info</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                                    <div><label style={{ fontSize: '0.7rem', opacity: 0.4 }}>NOMBRE</label><input style={inputStyle} value={editName} onChange={e => setEditName(e.target.value)} /></div>
                                    <div><label style={{ fontSize: '0.7rem', opacity: 0.4 }}>NACIMIENTO</label><input style={{...inputStyle, colorScheme: 'dark'}} type="date" value={editBirth} onChange={e => setEditBirth(e.target.value)} /></div>
                                    <div><label style={{ fontSize: '0.7rem', opacity: 0.4 }}>PESO (kg)</label><input style={inputStyle} type="number" step="0.1" value={editWeight} onChange={e => setEditWeight(e.target.value)} /></div>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(108,63,245,0.05)', border: '1px solid rgba(108,63,245,0.15)', borderRadius: 28, padding: '40px' }}>
                                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, marginBottom: 24 }}>Cuidado Específico {emoji}</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                                    <div><label style={{ fontSize: '0.7rem', opacity: 0.4 }}>HÁBITAT Y NOTAS</label><textarea style={{ ...inputStyle, height: 120, resize: 'none', marginTop: 6 }} value={editHabitat} onChange={e => setEditHabitat(e.target.value)} /></div>
                                    <div><label style={{ fontSize: '0.7rem', opacity: 0.4 }}>DIETA Y NUTRICIÓN</label><textarea style={{ ...inputStyle, height: 120, resize: 'none', marginTop: 6 }} value={editDiet} onChange={e => setEditDiet(e.target.value)} /></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                                    {Object.keys(editSpecificData).map(key => (
                                        <div key={key}>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.4 }}>{key.replace('_',' ').toUpperCase()}</label>
                                            <input style={inputStyle} value={editSpecificData[key]} onChange={e => setEditSpecificData({...editSpecificData, [key]: e.target.value})} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleSaveAll} disabled={saving} style={{ padding: '20px', borderRadius: 18, background: 'linear-gradient(135deg, #6C3FF5, #00D4FF)', border: 'none', color: 'white', fontWeight: 900, fontSize: '1rem', cursor: 'pointer' }}>{saving ? 'GUARDANDO...' : 'ACTUALIZAR PERFIL'}</button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div style={{ background: 'rgba(108,63,245,0.07)', border: '1px solid rgba(108,63,245,0.15)', borderRadius: 32, padding: '40px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                                        <div style={{ width: 50, height: 50, borderRadius: 16, background: 'rgba(108,63,245,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA' }}><Heart /></div>
                                        <div><h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Cuidado Adaptive</h2><p style={{ margin: 0, opacity: 0.4, fontSize: '0.85rem' }}>Protocolo personalizado</p></div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                        <div><div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#A78BFA', fontWeight: 800, fontSize: '0.7rem', marginBottom: 12 }}><Box size={14} /> ENTORNO</div><p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0, opacity: 0.7 }}>{profile?.habitat_notes || 'Sin datos.'}</p></div>
                                        <div><div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#10B981', fontWeight: 800, fontSize: '0.7rem', marginBottom: 12 }}><Leaf size={14} /> DIETA</div><p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0, opacity: 0.7 }}>{profile?.dietary_requirements || 'Sin datos.'}</p></div>
                                    </div>
                                    {profile?.specific_data && Object.keys(profile.specific_data).length > 0 && (
                                        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                                            {Object.entries(profile.specific_data).map(([k, v]) => (
                                                <div key={k} style={{ padding: '12px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.3 }}>{k.toUpperCase()}</div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{v}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 32, padding: '40px' }}>
                                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 800, marginBottom: 20 }}>Próximos Eventos 📅</h3>
                                    <Link href="/dashboard/calendar" style={{ display: 'inline-flex', padding: '12px 24px', borderRadius: 12, background: 'rgba(108,63,245,0.1)', color: '#A78BFA', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem' }}>IR AL CALENDARIO</Link>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 32, padding: '30px' }}>
                                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={18} /> Vitales</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                                        <span style={{ fontSize: '0.85rem', opacity: 0.5 }}>Peso</span>
                                        <span style={{ fontWeight: 800 }}>{pet.weight_kg ? `${pet.weight_kg} kg` : '--'}</span>
                                    </div>
                                    <Link href="/dashboard/wellness" style={{ display: 'block', textAlign: 'center', marginTop: 10, color: '#A78BFA', fontSize: '0.8rem', textDecoration: 'none' }}>VER HISTORIAL</Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            <style jsx>{`
                .dashboard-main { flex: 1; min-width: 0; background-color: #07070F; transition: all 0.3s; padding-left: 260px; position: relative; }
                @media (max-width: 1024px) { .dashboard-main { padding-left: 0; } }
                .noise-overlay { position: absolute; inset: 0; background-image: url('/noise.png'); opacity: 0.02; pointer-events: none; z-index: 0; }
                @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 0.8; } 100% { opacity: 0.4; } }
            `}</style>
        </div>
    )
}
