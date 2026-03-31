import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Post, Comment } from '@/lib/types'

export function useSocial(userId: string | null) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchPosts = useCallback(async () => {
    if (!userId) return
    try {
      setLoading(true)
      const { data: postsData, error: postsError } = await supabase
        .from('social_posts')
        .select('*, pet:pets(name, species, avatar_url), profile:profiles(display_name)')
        .order('created_at', { ascending: false })
        .limit(50)

      if (postsError) throw postsError

      if (postsData) {
        const postIds = postsData.map(p => p.id)
        const { data: myLikes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', postIds)

        const likedSet = new Set((myLikes || []).map(l => l.post_id))
        setPosts(postsData.map(p => ({ ...p, liked_by_me: likedSet.has(p.id) })))
      }
    } catch (err) {
      const e = err as Error
      console.error('Error fetching social posts:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const addPost = async (post: { pet_id: string | null, caption: string | null, image_url: string | null }) => {
    if (!userId) return

    const { data: newPost, error } = await supabase
      .from('social_posts')
      .insert({
        user_id: userId,
        ...post
      })
      .select('*, pet:pets(name, species, avatar_url), profile:profiles(display_name)')
      .single()

    if (error) throw error
    
    const builtPost: Post = {
      ...newPost,
      liked_by_me: false,
    }
    setPosts(prev => [builtPost, ...prev])
    return builtPost
  }

  const deletePost = async (postId: string) => {
    const { error } = await supabase.from('social_posts').delete().eq('id', postId)
    if (error) throw error
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  const uploadPostImage = async (file: File) => {
    if (!userId) return null
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${userId}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('post-images').upload(path, file, { contentType: file.type })
    if (upErr) throw upErr
    const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path)
    return publicUrl
  }

  const toggleLike = async (post: Post) => {
    if (!userId) return
    if (post.liked_by_me) {
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', userId)
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, liked_by_me: false, likes_count: p.likes_count - 1 } : p))
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: userId })
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, liked_by_me: true, likes_count: p.likes_count + 1 } : p))
    }
  }

  const fetchComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*, profile:profiles(display_name)')
      .eq('post_id', postId)
      .order('created_at')
    
    if (error) throw error
    return data as Comment[]
  }

  const addComment = async (postId: string, content: string) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content: content.trim(),
      })
      .select('*, profile:profiles(display_name)')
      .single()

    if (error) throw error
    
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
    return data as Comment
  }

  return {
    posts,
    loading,
    error,
    addPost,
    deletePost,
    uploadPostImage,
    toggleLike,
    fetchComments,
    addComment,
    refreshPosts: fetchPosts
  }
}
