'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { PageHeader } from '@/components/ui/PageHeader'
import Breadcrumbs from '@/components/Breadcrumbs'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useUser } from '@/hooks/useUser'
import { usePets } from '@/hooks/usePets'
import { useSocial } from '@/hooks/useSocial'
import { PostCard } from '@/components/PostCard'
import { PostModal } from '@/components/PostModal'

export default function SocialPage() {
    const { userId } = useUser()
    const { pets } = usePets(userId)
    const { posts, loading, addPost, deletePost, toggleLike, fetchComments, addComment, uploadPostImage } = useSocial(userId)

    const [showForm, setShowForm] = useState(false)

    const handlePost = async (postData: { caption: string, petId: string, imageFile: File | null }) => {
        let imageUrl: string | null = null
        if (postData.imageFile) {
            imageUrl = await uploadPostImage(postData.imageFile)
        }

        await addPost({
            pet_id: postData.petId || null,
            caption: postData.caption,
            image_url: imageUrl
        })
    }

    return (
        <div className="min-h-screen bg-[#07070F] text-white">
            <Sidebar />

            <main className="dashboard-main pb-20 px-6 sm:px-12 relative overflow-hidden">
                {/* Ambient glows */}
                <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,63,245,0.08) 0%, transparent 70%)', top: '-100px', right: '-100px', pointerEvents: 'none', zIndex: 0 }} />
                <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', bottom: '100px', left: '-100px', pointerEvents: 'none', zIndex: 0 }} />

                <div className="max-w-[720px] mx-auto pt-6 relative z-10">
                    <Breadcrumbs items={[{ label: 'Social' }]} />
                    <PageHeader
                        title="Social"
                        emoji="📸"
                        subtitle="Comparte los mejores momentos de tu mascota"
                        action={
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowForm(!showForm)}
                                className={`px-6 py-3 rounded-2xl border-none cursor-pointer font-outfit font-bold text-[0.88rem] transition-all flex items-center gap-2.5 ${showForm ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-gradient-to-br from-[#6C3FF5] to-[#00D4FF] text-white shadow-[0_8px_24px_rgba(108,63,245,0.4)] hover:shadow-[0_12px_32px_rgba(108,63,245,0.55)] shadow-[#6C3FF5]/40'}`}
                            >
                                {showForm ? '✕ Cancelar' : '✨ Nueva Publicación'}
                            </motion.button>
                        }
                    />

                    {/* New post form */}
                    <PostModal
                        show={showForm}
                        onClose={() => setShowForm(false)}
                        pets={pets}
                        onPost={handlePost}
                    />

                    {/* Feed */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="text-4xl"
                            >🐾</motion.div>
                            <p className="text-white/30 font-medium tracking-wide">BUSCANDO AVENTURAS...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 px-8 bg-white/[0.02] border border-white/5 rounded-[32px] backdrop-blur-sm"
                        >
                            <div className="text-7xl mb-6">📸</div>
                            <h2 className="font-outfit font-extrabold text-[1.8rem] mb-3 text-white">¡El muro está esperando!</h2>
                            <p className="text-white/40 mb-8 max-w-sm mx-auto leading-relaxed">Aún no hay publicaciones. Sé el primero en compartir un momento con tu mascota.</p>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowForm(true)} 
                                className="px-10 py-4 rounded-2xl border-none cursor-pointer bg-gradient-to-r from-[#6C3FF5] to-[#8B5CF6] text-white font-outfit font-bold text-[1rem] shadow-2xl shadow-[#6C3FF5]/40"
                            >
                                ✨ Hacer mi primera publicación
                            </motion.button>
                        </motion.div>
                    ) : (
                        <LayoutGroup>
                            <div className="flex flex-col gap-6">
                                <AnimatePresence initial={false}>
                                    {posts.map((post, index) => (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                            userId={userId || null}
                                            onLike={toggleLike}
                                            onDelete={deletePost}
                                            onFetchComments={fetchComments}
                                            onAddComment={addComment}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </LayoutGroup>
                    )}
                </div>
            </main>
        </div>
    )
}
