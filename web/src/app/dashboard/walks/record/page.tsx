'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Play, 
    Pause, 
    Square, 
    MapPin, 
    Timer, 
    TrendingUp, 
    X, 
    ChevronRight,
    Trophy,
    Navigation,
    Loader2
} from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Breadcrumbs from '@/components/Breadcrumbs'
import { PageHeader } from '@/components/ui/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { PremiumButton } from '@/components/ui/PremiumButton'

// ── Types & Constants ────────────────────────────────────────────────────────
interface RoutePoint {
    lat: number
    lng: number
    timestamp: number
}

interface Pet {
    id: string
    name: string
    avatar_url: string | null
}

const DARK_STYLES = [
    { elementType: 'geometry', stylers: [{ color: '#0f0f1a' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0f0f1a' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c1c2e' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#030d1a' }] },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371 // km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function WalksRecordPage() {
    const supabase = createClient()
    const router = useRouter()
    
    // Refs
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<google.maps.Map | null>(null)
    const polylineRef = useRef<google.maps.Polyline | null>(null)
    const markerRef = useRef<google.maps.Marker | null>(null)
    const watchIdRef = useRef<number | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const latestRouteRef = useRef<RoutePoint[]>([])

    // State
    const [userId, setUserId] = useState<string | null>(null)
    const [mapReady, setMapReady] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [route, setRoute] = useState<RoutePoint[]>([])
    const [distanceKm, setDistanceKm] = useState(0)
    const [durationSecs, setDurationSecs] = useState(0)
    const [startTime, setStartTime] = useState<Date | null>(null)
    const [pets, setPets] = useState<Pet[]>([])
    const [selectedPetId, setSelectedPetId] = useState<string>('')
    const [walkTitle, setWalkTitle] = useState('')
    const [saving, setSaving] = useState(false)
    const [rewardToShow, setRewardToShow] = useState<number | null>(null)

    // ── Pre-run ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) { router.push('/auth'); return }
            setUserId(user.id)
            fetchPets(user.id)
        })

        async function fetchPets(uid: string) {
            const { data } = await supabase.from('pets').select('id, name, avatar_url').eq('user_id', uid)
            if (data) {
                setPets(data)
                if (data.length > 0) setSelectedPetId(data[0].id)
            }
        }

        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    // ── Robust Maps script loading ──────────────────────────────────────────────
    useEffect(() => {
        (window as any).onGoogleMapsLoaded = () => setMapReady(true)

        if (window.google?.maps) {
            setMapReady(true)
            return
        }

        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
        if (existingScript) {
            const interval = setInterval(() => {
                if (window.google?.maps) {
                    setMapReady(true)
                    clearInterval(interval)
                }
            }, 500)
            return () => clearInterval(interval)
        }

        const script = document.createElement('script')
        const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''
        script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=geometry&callback=onGoogleMapsLoaded&loading=async`
        script.async = true
        script.defer = true
        document.head.appendChild(script)
    }, [])

    // ── Init map ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!mapReady || !mapContainerRef.current || mapInstanceRef.current) return

        mapInstanceRef.current = new google.maps.Map(mapContainerRef.current, {
            center: { lat: 40.4168, lng: -3.7038 }, // Madrid default
            zoom: 15,
            styles: DARK_STYLES,
            disableDefaultUI: true,
        })

        polylineRef.current = new google.maps.Polyline({
            path: [],
            geodesic: true,
            strokeColor: '#00E5A0',
            strokeOpacity: 1.0,
            strokeWeight: 4,
            map: mapInstanceRef.current
        })

        markerRef.current = new google.maps.Marker({
            map: mapInstanceRef.current,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: '#00D4FF',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#FFFFFF',
            },
        })

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                    mapInstanceRef.current?.setCenter(c)
                    markerRef.current?.setPosition(c)
                },
                null,
                { enableHighAccuracy: true }
            )
        }
    }, [mapReady])

    // Update refs whenever state changes
    useEffect(() => {
        latestRouteRef.current = route
    }, [route])

    // ── Recording Logic ─────────────────────────────────────────────────────────
    const startRecording = () => {
        if (!navigator.geolocation) return alert('Geolocation is not supported')
        setIsRecording(true)
        setIsPaused(false)
        setStartTime(new Date())
        setRoute([])
        setDistanceKm(0)
        setDurationSecs(0)

        timerRef.current = setInterval(() => setDurationSecs(prev => prev + 1), 1000)
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const point: RoutePoint = { lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: pos.timestamp }
                markerRef.current?.setPosition(point)
                mapInstanceRef.current?.setCenter(point)
                setRoute(prev => {
                    if (prev.length > 0) {
                        const last = prev[prev.length - 1]
                        const dist = calculateDistance(last.lat, last.lng, point.lat, point.lng)
                        if (dist > 0 && dist < 1) setDistanceKm(d => d + dist)
                    }
                    const updated = [...prev, point]
                    polylineRef.current?.setPath(updated.map(p => ({ lat: p.lat, lng: p.lng })))
                    return updated
                })
            },
            null,
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
        )
    }

    const togglePause = () => {
        if (isPaused) {
            setIsPaused(false)
            timerRef.current = setInterval(() => setDurationSecs(prev => prev + 1), 1000)
            watchIdRef.current = navigator.geolocation.watchPosition(
                (pos) => {
                    const point = { lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: pos.timestamp }
                    markerRef.current?.setPosition(point)
                    mapInstanceRef.current?.panTo(point)
                    setRoute(prev => {
                        if (prev.length > 0) {
                            const last = prev[prev.length - 1]
                            const dist = calculateDistance(last.lat, last.lng, point.lat, point.lng)
                            if (dist < 1) setDistanceKm(d => d + dist)
                        }
                        const updated = [...prev, point]
                        polylineRef.current?.setPath(updated)
                        return updated
                    })
                },
                null,
                { enableHighAccuracy: true }
            )
        } else {
            setIsPaused(true)
            if (timerRef.current) clearInterval(timerRef.current)
            if (watchIdRef.current) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null }
        }
    }

    const finishWalk = async () => {
        if (route.length < 2 && distanceKm < 0.01) {
            if (!confirm("El paseo es muy corto. ¿Finalizar?")) return
        }
        setSaving(true)
        if (timerRef.current) clearInterval(timerRef.current)
        if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)

        let earnedCoins = 0
        const durationHours = durationSecs / 3600
        const avgSpeed = durationHours > 0 ? distanceKm / durationHours : 0

        if (avgSpeed <= 25) { // Relaxed for bikes/running
            if (distanceKm >= 1) earnedCoins += Math.floor(distanceKm) * 15
            if (durationSecs >= 1200) earnedCoins += 20
            
            if (earnedCoins > 0 && userId) {
                const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0)
                const { data: todayWalks } = await supabase.from('walks').select('earned_coins').eq('user_id', userId).gte('created_at', startOfDay.toISOString())
                const coinsToday = todayWalks?.reduce((s, w) => s + (w.earned_coins || 0), 0) || 0
                earnedCoins = Math.min(earnedCoins, Math.max(0, 150 - coinsToday))
            }
        }

        const { error } = await supabase.from('walks').insert({
            user_id: userId,
            pet_id: selectedPetId || null,
            title: walkTitle || 'Paseo PetNova',
            route: route,
            distance_km: distanceKm,
            duration_seconds: durationSecs,
            start_time: startTime?.toISOString() || new Date().toISOString(),
            end_time: new Date().toISOString(),
            earned_coins: earnedCoins
        })

        if (!error && earnedCoins > 0) {
            const { data: profile } = await supabase.from('profiles').select('pet_coins').eq('id', userId).single()
            if (profile) await supabase.from('profiles').update({ pet_coins: (profile.pet_coins || 0) + earnedCoins }).eq('id', userId)
        }

        setSaving(false)
        if (error) alert('Error: ' + error.message)
        else if (earnedCoins > 0) setRewardToShow(earnedCoins)
        else router.push('/dashboard/walks')
    }

    const cancelWalk = () => {
        if (!confirm('¿Descartar este paseo?')) return
        if (timerRef.current) clearInterval(timerRef.current)
        if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
        router.push('/dashboard/walks')
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-140px)] gap-6 relative">
                <Breadcrumbs items={[{ label: 'Paseos', href: '/dashboard/walks' }, { label: 'Grabar' }]} />
                <PageHeader 
                    title="Registrador de Paseos" 
                    subtitle="Graba tu ruta y gana PetCoins por cada kilómetro" 
                    emoji="🐕"
                    action={
                        isRecording && (
                            <PremiumButton onClick={cancelWalk} className="bg-red-500/10 border-red-500/20 text-red-400 !px-4 hover:bg-red-500/20">
                                DESCARTAR
                            </PremiumButton>
                        )
                    }
                />

                <div className="flex-1 flex gap-6 relative min-h-0">
                    {/* Map Background */}
                    <GlassCard className="flex-1 relative overflow-hidden !p-0 border-white/5">
                        <div ref={mapContainerRef} className="w-full h-full grayscale-[0.2] contrast-[1.1]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        
                        {!mapReady && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#07070F] z-20">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        )}
                    </GlassCard>

                    {/* Controls Overlay */}
                    <AnimatePresence mode="wait">
                        {!isRecording ? (
                            <motion.div
                                key="setup"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                className="w-96 shrink-0 flex flex-col gap-4"
                            >
                                <GlassCard className="p-6 border-white/10">
                                    <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                                        <Play className="text-primary" size={20} fill="currentColor" />
                                        Nuevo Paseo
                                    </h3>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">Nombre de la ruta</label>
                                            <input
                                                type="text"
                                                value={walkTitle}
                                                onChange={e => setWalkTitle(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors font-bold text-sm"
                                                placeholder="Ej: Vuelta por el Retiro"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">Compañero de paseo</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {pets.map(pet => (
                                                    <button
                                                        key={pet.id}
                                                        onClick={() => setSelectedPetId(pet.id)}
                                                        className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                                                            selectedPetId === pet.id
                                                            ? 'bg-primary/10 border-primary text-white'
                                                            : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'
                                                        }`}
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden shrink-0 border border-white/10">
                                                            {pet.avatar_url ? <img src={pet.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">🐾</div>}
                                                        </div>
                                                        <span className="font-bold text-xs truncate">{pet.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <PremiumButton onClick={startRecording} className="w-full !py-4 text-sm mt-4">
                                            COMENZAR RASTREO
                                        </PremiumButton>
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-4 border-white/5 bg-primary/5">
                                    <div className="flex items-center gap-4 text-primary">
                                        <TrendingUp size={20} />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-tighter">Bono PetNova</p>
                                            <p className="text-xs font-bold text-white/80">Gana 15 PetCoins por cada km</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="active"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute bottom-6 left-6 right-6 z-30"
                            >
                                <GlassCard className="max-w-3xl mx-auto p-8 border-white/20 shadow-[0_32px_64px_rgba(0,0,0,0.8)] !bg-black/60 backdrop-blur-3xl overflow-visible">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-8 mb-8">
                                        <div className="text-center group">
                                            <div className="flex items-center justify-center gap-2 text-white/40 mb-2 font-black uppercase tracking-[0.2em] text-[10px]">
                                                <Timer size={14} /> Tiempo
                                            </div>
                                            <div className="text-4xl font-black text-white tabular-nums drop-shadow-2xl">
                                                {formatDuration(durationSecs)}
                                            </div>
                                        </div>
                                        <div className="w-px h-12 bg-white/10 invisible sm:visible" />
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 text-white/40 mb-2 font-black uppercase tracking-[0.2em] text-[10px]">
                                                <Navigation size={14} /> Distancia
                                            </div>
                                            <div className="text-4xl font-black text-primary tabular-nums drop-shadow-2xl">
                                                {distanceKm.toFixed(2)}<span className="text-sm ml-1 opacity-40">KM</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-4">
                                        <button
                                            onClick={togglePause}
                                            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 ${
                                                isPaused 
                                                ? 'bg-primary/20 border-primary text-primary hover:bg-primary/30' 
                                                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white'
                                            }`}
                                        >
                                            {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                                            {isPaused ? 'REANUDAR' : 'PAUSAR'}
                                        </button>
                                        <button
                                            onClick={finishWalk}
                                            disabled={saving}
                                            className="flex-[2] bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all shadow-[0_0_40px_rgba(239,68,68,0.3)] flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Square size={16} fill="currentColor" />}
                                            {saving ? 'GUARDANDO...' : 'FINALIZAR PASEO'}
                                        </button>
                                    </div>
                                    
                                    {/* Floating Pet Indicator */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black border border-white/20 px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 overflow-hidden ring-1 ring-primary/40">
                                            {pets.find(p => p.id === selectedPetId)?.avatar_url ? (
                                                <img src={pets.find(p => p.id === selectedPetId)?.avatar_url!} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px]">🐾</div>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Paseando con {pets.find(p => p.id === selectedPetId)?.name}</span>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Reward Modal */}
            <AnimatePresence>
                {rewardToShow !== null && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-md"
                        >
                            <GlassCard className="p-10 border-yellow-500/20 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500/50" />
                                <motion.div 
                                    animate={{ 
                                        rotateY: [0, 180, 360],
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-8xl mb-8 inline-block"
                                >
                                    🪙
                                </motion.div>
                                <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-yellow-300 to-yellow-600 bg-clip-text text-transparent">
                                    ¡EXCELENTE TRABAJO!
                                </h2>
                                <p className="text-white/40 font-bold mb-8 uppercase tracking-widest text-xs">Recompensa por el paseo</p>
                                
                                <div className="text-7xl font-black text-white mb-10 tracking-tighter">
                                    +{rewardToShow} <span className="text-2xl text-yellow-500 font-black">PC</span>
                                </div>
                                
                                <button
                                    onClick={() => router.push('/dashboard/walks')}
                                    className="w-full bg-white text-black font-black uppercase tracking-widest text-sm py-5 rounded-2xl hover:bg-yellow-500 hover:text-white transition-all shadow-2xl"
                                >
                                    RECOGER RECOMPENSA
                                </button>
                            </GlassCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    )
}
