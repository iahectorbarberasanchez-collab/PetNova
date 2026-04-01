'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'
import { Search, BookOpen, Info, Thermometer, Droplets, Heart, Sparkles, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- Types ---
interface WikiEntry {
    id: string; species_name: string; category: string; description: string | null; care_guide: any; common_health_issues: string[] | null; lifespan: string | null
}

const CATEGORIES = ['Todos', 'Perros', 'Gatos', 'Aves', 'Peces', 'Reptiles', 'Roedores', 'Exóticos']

export default function WikiPage() {
    const supabase = createClient()
    const [entries, setEntries] = useState<WikiEntry[]>([])
    const [filteredEntries, setFilteredEntries] = useState<WikiEntry[]>([])
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('Todos')
    const [loading, setLoading] = useState(true)
    const [selectedEntry, setSelectedEntry] = useState<WikiEntry | null>(null)

    useEffect(() => {
        fetchWiki()
    }, [])

    useEffect(() => {
        let results = entries.filter(e => 
            e.species_name.toLowerCase().includes(search.toLowerCase()) ||
            e.description?.toLowerCase().includes(search.toLowerCase())
        )
        if (activeCategory !== 'Todos') {
            results = results.filter(e => e.category === activeCategory)
        }
        setFilteredEntries(results)
    }, [search, activeCategory, entries])

    const fetchWiki = async () => {
        const { data } = await supabase.from('species_wiki').select('*').order('species_name', { ascending: true })
        setEntries(data || [])
        setLoading(false)
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#07070F' }}>
            <Sidebar />
            <main className="dashboard-main" style={{ overflowY: 'auto' }}>
                <div className="noise-overlay" />
                <div style={{ padding: 48, maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    
                    <div style={{ marginBottom: 60 }}>
                        <div style={{ display: 'inline-flex', padding: '6px 14px', borderRadius: 100, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF', fontSize: '0.75rem', fontWeight: 700, marginBottom: 16 }}>
                            BIBLIOTECA UNIVERSAL DE ESPECIES
                        </div>
                        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '3rem', fontWeight: 900, marginBottom: 20 }}>PetNova Wiki</h1>
                        
                        <div style={{ position: 'relative', maxWidth: 600 }}>
                            <Search style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                            <input 
                                style={{ width: '100%', boxSizing: 'border-box', padding: '18px 24px 18px 56px', borderRadius: 20, background: 'rgba(18,18,32,0.9)', border: '1px solid rgba(108,63,245,0.2)', color: 'white', fontSize: '1rem', outline: 'none' }} 
                                placeholder="Busca especies, razas o cuidados..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
                        {CATEGORIES.map(c => (
                            <button key={c} onClick={() => setActiveCategory(c)} style={{ padding: '10px 20px', borderRadius: 100, background: activeCategory === c ? '#6C3FF5' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>{c}</button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                        {filteredEntries.map(entry => (
                            <motion.div 
                                layoutId={entry.id}
                                key={entry.id} 
                                onClick={() => setSelectedEntry(entry)}
                                style={{ background: 'rgba(13,13,25,0.6)', borderRadius: 28, border: '1px solid rgba(255,255,255,0.05)', padding: 30, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                                whileHover={{ y: -5, borderColor: 'rgba(108,63,245,0.3)' }}
                            >
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#A78BFA', marginBottom: 12, letterSpacing: '0.1em' }}>{entry.category.toUpperCase()}</div>
                                <h3 style={{ margin: '0 0 12px', fontSize: '1.4rem', fontWeight: 900 }}>{entry.species_name}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'rgba(248,248,255,0.4)', lineHeight: 1.6, margin: '0 0 20px' }}>{entry.description?.slice(0, 120)}...</p>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.5 }}>⌛ {entry.lifespan || 'Variable'}</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00D4FF', display: 'flex', alignItems: 'center', gap: 4 }}>Saber más <ChevronRight size={14} /></span>
                                </div>
                            </motion.div>
                        ))}
                        {filteredEntries.length === 0 && !loading && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', opacity: 0.3 }}>
                                <Sparkles size={48} style={{ marginBottom: 16 }} />
                                <p>No encontramos esa especie. ¿Quieres que la IA genere su ficha?</p>
                                <button style={{ marginTop: 10, padding: '10px 20px', borderRadius: 12, background: 'rgba(108,63,245,0.2)', border: '1px solid #6C3FF5', color: '#A78BFA', cursor: 'pointer', fontWeight: 800 }}>GENERAR CON IA</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* DETAIL MODAL */}
                <AnimatePresence>
                    {selectedEntry && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(15px)' }}>
                            <motion.div layoutId={selectedEntry.id} style={{ width: 800, maxHeight: '85vh', overflowY: 'auto', background: '#0D0D1A', borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)', padding: 50, position: 'relative' }}>
                                <button onClick={() => setSelectedEntry(null)} style={{ position: 'absolute', top: 30, right: 30, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: 20, cursor: 'pointer' }}>×</button>
                                
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#A78BFA', marginBottom: 10 }}>Ficha Técnica {selectedEntry.category}</div>
                                <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 24, fontFamily: 'Outfit, sans-serif' }}>{selectedEntry.species_name}</h2>
                                
                                <div style={{ background: 'rgba(108,63,245,0.05)', borderRadius: 24, padding: 30, marginBottom: 40, border: '1px solid rgba(108,63,245,0.1)' }}>
                                    <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: 1.6, opacity: 0.8 }}>{selectedEntry.description}</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                                    <div>
                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, fontWeight: 800 }}><Heart color="#EF4444" size={20} /> Salud y Longevidad</h4>
                                        <p style={{ fontSize: '0.9rem', opacity: 0.5, marginBottom: 12 }}>Longevidad media: {selectedEntry.lifespan}</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                            {selectedEntry.common_health_issues?.map(issue => (
                                                <span key={issue} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: '0.75rem', fontWeight: 800 }}>{issue}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, fontWeight: 800 }}><BookOpen color="#00D4FF" size={20} /> Guía de Cuidados</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {selectedEntry.care_guide && Object.entries(selectedEntry.care_guide).map(([k, v]) => (
                                                <div key={k} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 16 }}>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.3, marginBottom: 4 }}>{k.toUpperCase()}</div>
                                                    <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{v as string}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => setSelectedEntry(null)} style={{ width: '100%', marginTop: 50, padding: 20, borderRadius: 20, background: 'linear-gradient(to right, #6C3FF5, #00D4FF)', border: 'none', color: 'white', fontWeight: 900, cursor: 'pointer' }}>VOLVER A LA WIKI</button>
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
