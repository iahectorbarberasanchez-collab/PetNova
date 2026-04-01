'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Search, 
    MapPin, 
    Navigation, 
    Star, 
    Clock, 
    X,
    Filter as FilterIcon,
    Stethoscope,
    Trees as Park,
    ShoppingBag,
    Scissors,
    Home,
    SearchCheck,
    Loader2
} from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Breadcrumbs from '@/components/Breadcrumbs'
import { PageHeader } from '@/components/ui/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { PremiumButton } from '@/components/ui/PremiumButton'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Place {
    id: string
    name: string
    type: PlaceType
    address: string
    rating?: number
    lat: number
    lng: number
    isOpen?: boolean
}

type PlaceType = 'vet' | 'park' | 'shop' | 'grooming' | 'shelter'

const createSvgElement = (color: string, icon: React.ReactNode) => {
    const div = document.createElement('div')
    div.className = 'marker-wrapper'
    div.style.filter = `drop-shadow(0px 4px 12px ${color}60)`
    div.innerHTML = `
        <div style="
            background: #131325;
            border: 2px solid ${color};
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${color};
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        " class="map-marker-pin">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                ${(icon as any).props.children}
            </svg>
        </div>
    `
    return div
}

const PLACE_CONFIG: Record<PlaceType, { label: string; icon: React.ReactNode; color: string; types: string[]; emoji: string }> = {
    vet: { 
        label: 'Veterinarias', 
        emoji: '🏥',
        icon: <Stethoscope size={20} />, 
        color: '#00D4FF', 
        types: ['veterinary_care'] 
    },
    park: { 
        label: 'Pipican', 
        emoji: '🌳',
        icon: <Park size={20} />, 
        color: '#00E5A0', 
        types: ['park', 'dog_park'] 
    },
    shop: { 
        label: 'Tiendas', 
        emoji: '🛒',
        icon: <ShoppingBag size={20} />, 
        color: '#F59E0B', 
        types: ['pet_store'] 
    },
    grooming: { 
        label: 'Peluquerías', 
        emoji: '✂️',
        icon: <Scissors size={20} />, 
        color: '#FF6B9D', 
        types: ['dog_boarding', 'dog_groomer'] 
    },
    shelter: { 
        label: 'Refugios', 
        emoji: '🏠',
        icon: <Home size={20} />, 
        color: '#A78BFA', 
        types: ['animal_shelter'] 
    },
}

export default function MapPage() {
    const supabase = createClient()
    const router = useRouter()
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<google.maps.Map | null>(null)
    const markersRef = useRef<(google.maps.Marker | google.maps.marker.AdvancedMarkerElement)[]>([])

    const [authLoading, setAuthLoading] = useState(true)
    const [mapReady, setMapReady] = useState(false)
    const [activeFilter, setActiveFilter] = useState<PlaceType | null>(null)
    const [places, setPlaces] = useState<Place[]>([])
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
    const [userPos, setUserPos] = useState<{ lat: number; lng: number }>({ lat: 41.3851, lng: 2.1734 })
    const [searching, setSearching] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [locError, setLocError] = useState<string | null>(null)
    
    const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!

    // ── Auth ────────────────────────────────────────────────────────────────────
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) router.push('/auth')
            else setAuthLoading(false)
        })
    }, [])

    // ── Robust Maps script loading ──────────────────────────────────────────────
    useEffect(() => {
        if (authLoading) return
        
        // Use a persistent callback name to avoid redeclaration issues
        (window as any).onGoogleMapsLoaded = () => setMapReady(true)

        if (window.google?.maps) {
            setMapReady(true)
            return
        }

        // Check if script already exists to avoid conflict
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
        if (existingScript) {
            // Script is already there, maybe it hasn't loaded yet?
            // If it has no callback in URL, we might need to wait for google.maps to appear
            const interval = setInterval(() => {
                if (window.google?.maps) {
                    setMapReady(true)
                    clearInterval(interval)
                }
            }, 500)
            return () => clearInterval(interval)
        }

        const script = document.createElement('script')
        script.id = 'petnova-gmap-script'
        script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places,geometry,marker&callback=onGoogleMapsLoaded&loading=async`
        script.async = true
        script.defer = true
        document.head.appendChild(script)
    }, [authLoading])

    // ── Init map ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!mapReady || !mapRef.current) return

        const map = new window.google.maps.Map(mapRef.current, {
            center: userPos,
            zoom: 14,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            mapId: 'PetNova_MAP_ID_v2', // Custom ID for advanced markers
            // Premium dark theme via mapId is preferred, but for reference:
            styles: [
                { elementType: 'geometry', stylers: [{ color: '#0f0f1a' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#0f0f1a' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c1c2e' }] },
                { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#030d1a' }] },
            ]
        })
        mapInstanceRef.current = map

        // Geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const ul = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                    setUserPos(ul)
                    map.setCenter(ul)
                    
                    // User position marker
                    if (window.google.maps.marker?.AdvancedMarkerElement) {
                        const userDot = document.createElement('div')
                        userDot.innerHTML = `
                            <div style="position: relative;">
                                <div style="width: 24px; height: 24px; background: #6C3FF5; border: 4px solid white; border-radius: 50%; box-shadow: 0 0 15px #6C3FF5;"></div>
                                <div style="position: absolute; top: -12px; left: -12px; width: 48px; height: 48px; background: #6C3FF520; border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                            </div>
                            <style>
                                @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
                            </style>
                        `
                        new window.google.maps.marker.AdvancedMarkerElement({
                            map,
                            position: ul,
                            content: userDot,
                            title: 'Tu ubicación',
                            zIndex: 1000,
                        })
                    }
                },
                () => setLocError('No se pudo obtener tu ubicación. Mostrando predeterminado.')
            )
        }
    }, [mapReady])

    // ── Search & Filters ────────────────────────────────────────────────────────
    const clearMarkers = () => {
        markersRef.current.forEach(m => {
            if ('setMap' in m) m.setMap(null)
            else m.map = null
        })
        markersRef.current = []
    }

    const performSearch = (type?: PlaceType, query?: string) => {
        const map = mapInstanceRef.current
        if (!map || !mapReady) return

        if (type && activeFilter === type && !query) {
            setActiveFilter(null); clearMarkers(); setPlaces([]); setSelectedPlace(null); return
        }

        setSearching(true)
        if (type) setActiveFilter(type)
        else setActiveFilter(null)
        
        clearMarkers()
        setPlaces([])
        setSelectedPlace(null)

        const service = new window.google.maps.places.PlacesService(map)
        const cfg = type ? PLACE_CONFIG[type] : null

        const request: google.maps.places.TextSearchRequest = {
            query: query || (cfg ? `${cfg.label} mascotas` : 'pet friendly'),
            location: map.getCenter(),
            radius: 5000,
        }

        service.textSearch(request, (results, status) => {
            setSearching(false)
            if (status !== window.google.maps.places.PlacesServiceStatus.OK || !results) return

            const found: Place[] = []
            const bounds = new window.google.maps.LatLngBounds()

            results.slice(0, 20).forEach(r => {
                if (!r.geometry?.location) return
                const lat = r.geometry.location.lat()
                const lng = r.geometry.location.lng()

                const place: Place = {
                    id: r.place_id || Math.random().toString(),
                    name: r.name || 'Sin nombre',
                    type: type || 'vet', // fallback
                    address: r.formatted_address || r.vicinity || '',
                    rating: r.rating,
                    lat, lng,
                    isOpen: (r as any).opening_hours?.isOpen?.()
                }
                found.push(place)
                bounds.extend({ lat, lng })

                // Create Advanced Marker
                if (window.google.maps.marker?.AdvancedMarkerElement) {
                    const iconColor = type ? PLACE_CONFIG[type].color : '#6C3FF5'
                    const marker = new window.google.maps.marker.AdvancedMarkerElement({
                        map,
                        position: { lat, lng },
                        title: place.name,
                        content: createSvgElement(iconColor, type ? PLACE_CONFIG[type].icon : <MapPin size={20} />),
                    })
                    
                    marker.addListener('click', () => {
                        setSelectedPlace(place)
                        map.panTo({ lat, lng })
                        map.setZoom(16)
                    })
                    markersRef.current.push(marker)
                }
            })

            setPlaces(found)
            if (found.length > 0) {
                map.fitBounds(bounds, { top: 100, bottom: 100, left: 100, right: 100 })
            }
        })
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
                <p className="text-white/40 font-bold tracking-widest uppercase text-xs">PetNova Map</p>
            </motion.div>
        </div>
    )

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
                <div>
                    <Breadcrumbs items={[{ label: 'Mapa Interactivo' }]} />
                    <PageHeader
                        title="Explorador Pet-Friendly"
                        subtitle={locError || "Encuentra lo mejor para tu mascota cerca de ti"}
                        emoji="🗺️"
                        action={
                            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                                <Search className="ml-4 text-white/20 my-auto" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar servicios..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && performSearch(undefined, searchQuery)}
                                    className="bg-transparent border-none py-3 px-4 text-sm font-bold text-white focus:outline-none w-64 placeholder:text-white/20"
                                />
                                <PremiumButton 
                                    onClick={() => performSearch(undefined, searchQuery)}
                                    className="!py-2 !rounded-xl text-xs"
                                >
                                    BUSCAR
                                </PremiumButton>
                            </div>
                        }
                    />
                </div>

                {/* Filters Overlay */}
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none shrink-0">
                    {(Object.entries(PLACE_CONFIG) as [PlaceType, typeof PLACE_CONFIG[PlaceType]][]).map(([key, cfg]) => (
                        <button 
                            key={key} 
                            onClick={() => performSearch(key)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all font-bold whitespace-nowrap ${
                                activeFilter === key 
                                ? 'bg-white/10 border-white/20 text-white' 
                                : 'bg-black/20 border-white/5 text-white/40 hover:border-white/10 hover:text-white/60'
                            }`}
                            style={{ 
                                borderColor: activeFilter === key ? cfg.color : undefined,
                                color: activeFilter === key ? cfg.color : undefined
                            }}
                        >
                            {cfg.icon}
                            <span className="text-sm">{cfg.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-1 flex gap-6 min-h-0 relative">
                    {/* Map Container */}
                    <GlassCard className="flex-1 relative overflow-hidden !p-0 border-white/5 group">
                        <div ref={mapRef} className="w-full h-full grayscale-[0.2] contrast-[1.1]" />
                        
                        {!mapReady && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#07070F]">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-white/5 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-white/30 text-xs font-black uppercase tracking-widest">Iniciando Google Maps...</p>
                                </div>
                            </div>
                        )}

                        {/* Search Indicator */}
                        <AnimatePresence>
                            {searching && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="absolute top-6 left-1/2 -translate-x-1/2 z-20"
                                >
                                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-4 shadow-2xl">
                                        <Loader2 className="animate-spin text-primary" size={18} />
                                        <span className="text-sm font-black text-white/80 tracking-tight">Rastreando servicios...</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Map Controls */}
                        <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-20">
                            <button
                                onClick={() => {
                                    if (mapInstanceRef.current && userPos) {
                                        mapInstanceRef.current.panTo(userPos)
                                        mapInstanceRef.current.setZoom(15)
                                    }
                                }}
                                className="w-14 h-14 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-primary shadow-2xl hover:scale-110 active:scale-95 transition-all group"
                            >
                                <Navigation size={24} className="group-hover:rotate-12 transition-transform" />
                            </button>
                        </div>
                    </GlassCard>

                    {/* Left Results Panel (Sleek Overlay style) */}
                    <AnimatePresence>
                        {places.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                className="w-96 flex flex-col gap-4 shrink-0 overflow-hidden"
                            >
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="font-black text-lg tracking-tight flex items-center gap-2">
                                        <SearchCheck className="text-primary" size={20} />
                                        Resultados
                                        <span className="text-white/20 font-bold ml-1">{places.length}</span>
                                    </h3>
                                    <button 
                                        onClick={() => { clearMarkers(); setPlaces([]) }}
                                        className="p-2 rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                    {places.map(place => {
                                        const isSelected = selectedPlace?.id === place.id
                                        const cfg = PLACE_CONFIG[place.type] || PLACE_CONFIG.vet
                                        
                                        return (
                                            <motion.div
                                                key={place.id}
                                                layoutId={place.id}
                                                onClick={() => {
                                                    setSelectedPlace(place)
                                                    mapInstanceRef.current?.panTo({ lat: place.lat, lng: place.lng })
                                                    mapInstanceRef.current?.setZoom(17)
                                                }}
                                                className={`cursor-pointer group relative ${isSelected ? 'z-10' : 'z-0'}`}
                                            >
                                                <GlassCard className={`p-4 transition-all duration-300 border-white/5 ${
                                                    isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-white/10'
                                                }`}>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex-1">
                                                            <h4 className="font-black text-sm text-white/90 group-hover:text-primary transition-colors leading-tight">
                                                                {place.name}
                                                            </h4>
                                                            <div className="flex items-center gap-3 mt-1.5">
                                                                {place.rating && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                                                        <span className="text-[10px] font-black text-white/60">{place.rating}</span>
                                                                    </div>
                                                                )}
                                                                {place.isOpen !== undefined && (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className={`w-1.5 h-1.5 rounded-full ${place.isOpen ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${place.isOpen ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                            {place.isOpen ? 'Abierto' : 'Cerrado'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="p-2 rounded-xl bg-white/5 text-[10px]" style={{ color: cfg.color }}>
                                                            {cfg.icon}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 mb-4">
                                                        <MapPin size={12} className="text-white/20 shrink-0" />
                                                        <p className="text-[11px] text-white/40 truncate">{place.address}</p>
                                                    </div>

                                                    <a
                                                        href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        onClick={e => e.stopPropagation()}
                                                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-primary/20 text-[10px] font-black uppercase tracking-widest transition-all text-white/60 hover:text-white"
                                                    >
                                                        <Navigation size={12} />
                                                        Cómo llegar
                                                    </a>
                                                </GlassCard>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    )
}
