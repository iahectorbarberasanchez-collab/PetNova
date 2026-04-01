'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { ShieldAlert, Activity, Heart, Info, Phone, MessageCircle, AlertTriangle, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const GUIDES = [
  {
    id: 'choking',
    title: 'Atragantamiento',
    icon: Activity,
    color: '#EF4444',
    steps: [
      'Abre la boca con cuidado y busca objetos visibles.',
      'Si puedes verlo, retira el objeto con unas pinzas o los dedos (¡Cuidado con mordiscos!).',
      'Si no sale, realiza la Maniobra de Heimlich para mascotas.',
      'Lleva urgentemente al veterinario incluso si el objeto sale.'
    ],
    urgency: 'CRÍTICA'
  },
  {
    id: 'heatstroke',
    title: 'Golpe de Calor',
    icon: AlertTriangle,
    color: '#F59E0B',
    steps: [
      'Mueve a la mascota a un lugar fresco y a la sombra.',
      'MOJA (no sumerjas) con agua templada (ni fría ni helada).',
      'Ofrece agua fresca si puede beber por sí solo.',
      'Mantén ventilación directa constante.'
    ],
    urgency: 'ALTA'
  },
  {
    id: 'poison',
    title: 'Envenenamiento',
    icon: ShieldAlert,
    color: '#8B5CF6',
    steps: [
      'Identifica qué ha ingerido (planta, químico, chocolate...).',
      'NO provoques el vómito sin indicación veterinaria.',
      'Llama al centro toxicológico animal inmediatamente.',
      'Recoge una muestra de lo ingerido para el veterinario.'
    ],
    urgency: 'CRÍTICA'
  },
  {
    id: 'wounds',
    title: 'Heridas / Cortes',
    icon: Heart,
    color: '#10B981',
    steps: [
      'Limpia la zona con suero fisiológico o agua limpia.',
      'Aplica presión con una gasa estéril si hay sangrado.',
      'No apliques alcohol ni agua oxigenada directamente.',
      'Venda suavemente y evita que se lama.'
    ],
    urgency: 'MEDIA'
  }
]

export default function FirstAidPage() {
    const [selectedGuide, setSelectedGuide] = useState<typeof GUIDES[0] | null>(null)

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#07070F' }}>
            <Sidebar />
            <main className="dashboard-main" style={{ overflowY: 'auto' }}>
                <div className="noise-overlay" />
                <div style={{ padding: 48, maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    
                    <div style={{ marginBottom: 60, textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', padding: '8px 24px', borderRadius: 100, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.8rem', fontWeight: 900, marginBottom: 20 }}>
                            PROTOCOLO DE EMERGENCIA 🆘
                        </div>
                        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '3.5rem', fontWeight: 900, marginBottom: 20 }}>Primeros Auxilios</h1>
                        <p style={{ maxWidth: 600, margin: '0 auto', opacity: 0.5, lineHeight: 1.6 }}>Guías rápidas para actuar en los primeros minutos críticos. Mantén siempre el contacto de tu veterinario a mano.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
                        {GUIDES.map(guide => (
                            <div 
                                key={guide.id} 
                                onClick={() => setSelectedGuide(guide)}
                                style={{ background: 'rgba(13,13,25,0.6)', borderRadius: 28, border: '1px solid rgba(255,255,255,0.05)', padding: 32, cursor: 'pointer', transition: 'all 0.3s' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 16, background: `${guide.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: guide.color }}><guide.icon size={24} /></div>
                                    <div>
                                        <h3 style={{ margin: 0, fontWeight: 800 }}>{guide.title}</h3>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: guide.color }}>URGENCIA: {guide.urgency}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(248,248,255,0.4)', fontSize: '0.85rem' }}>Ver instrucciones completas <ChevronRight size={14} /></div>
                            </div>
                        ))}
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #121220, #07070F)', borderRadius: 32, border: '1px solid rgba(255,255,255,0.05)', padding: 40, display: 'flex', alignItems: 'center', gap: 32 }}>
                        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}><Phone size={40} /></div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 8px', fontWeight: 800 }}>¿Necesitas Ayuda Profesional?</h3>
                            <p style={{ margin: 0, opacity: 0.4, fontSize: '0.9rem' }}>Contacta con el hospital de emergencias más cercano o usa nuestra videollamada SOS.</p>
                        </div>
                        <button style={{ padding: '16px 32px', borderRadius: 16, background: '#10B981', border: 'none', color: 'white', fontWeight: 900, cursor: 'pointer' }}>LLAMAR VETERINARIO</button>
                    </div>
                </div>

                {/* MODAL */}
                <AnimatePresence>
                    {selectedGuide && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)' }}>
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ width: 500, background: '#0D0D1A', borderRadius: 40, border: `2px solid ${selectedGuide.color}30`, padding: 50, position: 'relative' }}>
                                <button onClick={() => setSelectedGuide(null)} style={{ position: 'absolute', top: 30, right: 30, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: 20, cursor: 'pointer' }}><X size={20} /></button>
                                
                                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                                    <div style={{ width: 80, height: 80, borderRadius: 24, background: `${selectedGuide.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedGuide.color, margin: '0 auto 20px' }}><selectedGuide.icon size={40} /></div>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>{selectedEntry?.title}</h2>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 900, color: selectedGuide.color, marginTop: 8 }}>MANTÉN LA CALMA. SIGUE LOS PASOS:</div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {selectedGuide.steps.map((step, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 20, background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 20, border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <div style={{ width: 30, height: 30, borderRadius: 10, background: selectedGuide.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '0.9rem', flexShrink: 0 }}>{i + 1}</div>
                                            <div style={{ fontSize: '1rem', lineHeight: 1.6, opacity: 0.8 }}>{step}</div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: 40, padding: '20px', borderRadius: 20, background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.2)', display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <AlertTriangle color="#EF4444" size={20} />
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#EF4444', fontWeight: 800 }}>ESTA GUÍA NO SUSTITUYE EL CRITERIO VETERINARIO.</p>
                                </div>
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
