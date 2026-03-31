import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        setUser(authUser)

        if (authUser) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()
          setProfile(prof)
        }
      } catch (error) {
        console.error('Error in useUser:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase])

  return { user, profile, loading, userId: user?.id ?? null }
}
