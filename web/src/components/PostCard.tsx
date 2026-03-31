'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Post, Comment } from '@/lib/types'

interface PostCardProps {
  post: Post
  userId: string | null
  onLike: (post: Post) => Promise<void>
  onDelete: (postId: string) => Promise<void>
  onFetchComments: (postId: string) => Promise<Comment[]>
  onAddComment: (postId: string, content: string) => Promise<Comment | undefined>
}

const SPECIES_EMOJI: Record<string, string> = {
  Dog: '🐶', Cat: '🐱', Bird: '🐦', Fish: '🐠', Rabbit: '🐇', Hamster: '🐹', Reptile: '🦎', Other: '🐾',
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'ahora mismo'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  return `hace ${Math.floor(diff / 86400)}d`
}

export function PostCard({ post, userId, onLike, onDelete, onFetchComments, onAddComment }: PostCardProps) {
  const [openComments, setOpenComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)

  const handleToggleComments = async () => {
    if (!openComments) {
      setLoadingComments(true)
      try {
        const data = await onFetchComments(post.id)
        setComments(data)
      } catch (error) {
        console.error('Error loading comments:', error)
      } finally {
        setLoadingComments(false)
      }
    }
    setOpenComments(!openComments)
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    setSubmittingComment(true)
    try {
      const newComment = await onAddComment(post.id, commentText)
      if (newComment) {
        setComments(prev => [...prev, newComment])
        setCommentText('')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="bg-white/[0.04] backdrop-blur-xl border border-white/5 rounded-[24px] overflow-hidden shadow-xl"
    >
      {/* Post header */}
      <div className="px-5 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3.5">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-[48px] h-[48px] rounded-2xl bg-gradient-to-br from-[#6C3FF5]/20 to-[#00D4FF]/20 border border-white/10 flex items-center justify-center text-xl shrink-0"
          >
            {post.pet ? SPECIES_EMOJI[post.pet.species as keyof typeof SPECIES_EMOJI] || '🐾' : '🐾'}
          </motion.div>
          <div>
            <div className="font-bold text-[0.98rem] font-outfit text-white flex items-center gap-1.5">
              {post.profile?.display_name || 'Usuario'}
              {post.pet && (
                <span className="font-medium text-white/40 text-[0.85rem] bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                  con {post.pet.name}
                </span>
              )}
            </div>
            <div className="text-[0.75rem] text-white/20 font-medium">{timeAgo(post.created_at)}</div>
          </div>
        </div>
        {post.user_id === userId && (
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,100,100,0.1)', color: '#FF7070' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(post.id)}
            className="w-9 h-9 flex items-center justify-center bg-transparent border-none cursor-pointer text-[0.95rem] text-white/10 rounded-xl transition-all"
          >
            🗑️
          </motion.button>
        )}
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="relative group overflow-hidden bg-black/20">
          <img src={post.image_url} alt="post" className="w-full max-h-[500px] object-cover block transition-transform duration-500 group-hover:scale-[1.02]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Content */}
      {post.caption && (
        <div className="px-6 py-5">
          <p className="text-[1.02rem] leading-relaxed text-white/85 font-inter">
            {post.caption}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 pb-5 flex gap-6 items-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onLike(post)}
          className={`bg-transparent border-none flex items-center gap-2 text-[0.95rem] font-bold transition-all cursor-pointer p-0 ${post.liked_by_me ? 'text-[#6C3FF5]' : 'text-white/30 hover:text-white/50'}`}
        >
          <span className={`text-2xl transition-all ${post.liked_by_me ? 'filter drop-shadow-[0_0_10px_rgba(108,63,245,0.8)]' : 'filter grayscale opacity-60'}`}>
            🐾
          </span>
          <span className={post.liked_by_me ? 'text-[#A78BFA]' : ''}>
            {post.likes_count > 0 ? post.likes_count : 'Me gusta'}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleComments}
          className={`bg-transparent border-none flex items-center gap-2 text-[0.95rem] font-bold p-0 cursor-pointer transition-all ${openComments ? 'text-[#00D4FF]' : 'text-white/30 hover:text-white/50'}`}
        >
          <span className="text-2xl">💬</span>
          <span>{post.comments_count > 0 ? post.comments_count : 'Comentar'}</span>
        </motion.button>
      </div>

      {/* Comments panel */}
      <AnimatePresence>
        {openComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-black/20 overflow-hidden"
          >
            <div className="p-6">
              {loadingComments ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin text-xl">🐾</div>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-[0.88rem] text-white/30 mb-5 text-center italic">No hay comentarios aún. Dale un poco de amor. ❤️</p>
              ) : (
                <div className="flex flex-col gap-4 mb-6">
                  {comments.map((c, i) => (
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      key={c.id}
                      className="flex gap-3 items-start"
                    >
                      <div className="w-[34px] h-[34px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm shrink-0">🐾</div>
                      <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 flex-1">
                        <div className="text-[0.78rem] font-bold text-[#A78BFA] mb-1">{c.profile?.display_name || 'Usuario'}</div>
                        <div className="text-[0.92rem] text-white/80 leading-snug font-inter">{c.content}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              <div className="flex gap-3 items-center">
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  maxLength={300}
                  placeholder="Añadir un comentario..."
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 font-inter text-[0.9rem] text-[#F8F8FF] outline-none focus:border-[#6C3FF5] focus:ring-1 focus:ring-[#6C3FF5]/30 transition-all placeholder:text-white/20"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || submittingComment}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl border-none font-bold text-xl transition-all cursor-pointer ${(!commentText.trim() || submittingComment) ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-[#6C3FF5] text-white hover:bg-[#8B5CF6]'}`}
                >
                  {submittingComment ? '⏳' : '→'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
