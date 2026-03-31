import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HealthRecord } from '@/lib/types'

export function useHealthRecords(petId?: string | null) {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchHealthRecords = useCallback(async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('health_records')
        .select('*')
        .order('date_administered', { ascending: false })

      if (petId && petId !== 'all') {
        query = query.eq('pet_id', petId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      
      setRecords(data as HealthRecord[] || [])
    } catch (err) {
      const e = err as Error
      console.error('Error fetching health records:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [petId, supabase])

  useEffect(() => {
    fetchHealthRecords()
  }, [fetchHealthRecords])

  const addRecord = async (record: Omit<HealthRecord, 'id' | 'created_at'>) => {
    const { data, error: insertError } = await supabase
      .from('health_records')
      .insert(record)
      .select()
      .single()

    if (insertError) throw insertError
    setRecords(prev => [data as HealthRecord, ...prev])
    return data as HealthRecord
  }

  const deleteRecord = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('health_records')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError
    setRecords(prev => prev.filter(r => r.id !== id))
  }

  return { records, loading, error, addRecord, deleteRecord, refresh: fetchHealthRecords }
}
