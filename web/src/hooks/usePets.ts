import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pet } from '@/lib/types'

export function usePets(userId: string | null) {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchPets = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: true })
    
    if (petError) {
      setError(petError.message)
    } else {
      setPets(data || [])
    }
    setLoading(false)
  }, [userId, supabase])

  const deletePet = useCallback(async (petId: string) => {
    const { error: delError } = await supabase.from('pets').delete().eq('id', petId)
    if (!delError) {
      setPets(prev => prev.filter(p => p.id !== petId))
      return true
    }
    return false
  }, [supabase])

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  return { pets, loading, error, refreshPets: fetchPets, deletePet }
}
