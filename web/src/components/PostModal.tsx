'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pet } from '@/lib/types'

interface PostModalProps {
  show: boolean
  onClose: () => void
  pets: Pet[]
  onPost: (post: { caption: string, petId: string, imageFile: File | null }) => Promise<void>
}

const SPECIES_EMOJI: Record<string, string> = {
  Dog: '🐶', Cat: '🐱', Bird: '🐦', Fish: '🐠', Rabbit: '🐇', Hamster: '🐹', Reptile: '🦎', Other: '🐾',
}

export function PostModal({ show, onClose, pets, onPost }: PostModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [caption, setCaption] = useState('')
  const [selectedPetId, setSelectedPetId] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handlePost = async () => {
    if (!caption.trim() && !imageFile) return
    setPosting(true)
    try {
      await onPost({ caption, petId: selectedPetId, imageFile })
      setCaption(''); setImageFile(null); setImagePreview(null); setSelectedPetId('')
      onClose()
    } catch (error) {
      console.error('Error in PostModal onPost:', error)
    } finally {
      setPosting(false)
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0, scale: 0.95, marginBottom: 0 }}
          animate={{ height: 'auto', opacity: 1, scale: 1, marginBottom: 32 }}
          exit={{ height: 0, opacity: 0, scale: 0.95, marginBottom: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[28px] p-7 shadow-2xl overflow-hidden"
        >
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
          
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-outfit font-extrabold text-[1.1rem] text-white flex items-center gap-2">
              <span style={{ transform: 'rotate(10deg)', display: 'inline-block' }}>✍️</span> Crear publicación
            </h3>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors text-sm font-bold">✕ Cerrar</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6">
            <div className="flex flex-col gap-4">
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                maxLength={500}
                placeholder="¿Qué está pasando hoy? 🐾"
                className="w-full box-border bg-black/40 border border-white/10 rounded-2xl px-4 py-4 font-inter text-[0.95rem] text-[#F8F8FF] outline-none resize-none min-h-[140px] focus:border-[#6C3FF5] focus:ring-[4px] focus:ring-[#6C3FF5]/10 transition-all placeholder:text-white/20"
              />
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <select 
                    value={selectedPetId} 
                    onChange={e => setSelectedPetId(e.target.value)} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 font-inter text-[0.9rem] text-[#F8F8FF] outline-none cursor-pointer focus:border-[#6C3FF5] transition-all appearance-none"
                  >
                    <option value="">¿Quién es el protagonista?</option>
                    {pets.map(p => <option key={p.id} value={p.id}>{SPECIES_EMOJI[p.species as keyof typeof SPECIES_EMOJI]} {p.name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 text-xs">▼</div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePost}
                  disabled={posting || (!caption.trim() && !imageFile)}
                  className={`px-8 py-3.5 rounded-xl border-none font-outfit font-bold text-[0.95rem] transition-all flex items-center justify-center gap-2 shrin-0 ${posting || (!caption.trim() && !imageFile) ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-gradient-to-r from-[#6C3FF5] to-[#00D4FF] text-white shadow-xl shadow-[#6C3FF5]/30 cursor-pointer hover:shadow-[#6C3FF5]/50'}`}
                >
                  {posting ? '⏳ Publicando...' : '🚀 Publicar'}
                </motion.button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <motion.div
                whileHover={{ scale: 1.02, borderColor: 'rgba(108,63,245,0.4)' }}
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square bg-black/40 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer overflow-hidden flex flex-col items-center justify-center transition-all group"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="text-3xl mb-2 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">📸</div>
                    <span className="text-[0.7rem] text-white/40 font-bold group-hover:text-white/60">SUBIR FOTO</span>
                  </>
                )}
              </motion.div>
              {imagePreview && (
                <button onClick={() => { setImageFile(null); setImagePreview(null) }} className="text-[0.75rem] text-red-400 bg-transparent border-none cursor-pointer font-bold hover:text-red-300 transition-colors">
                  ✕ Eliminar foto
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
