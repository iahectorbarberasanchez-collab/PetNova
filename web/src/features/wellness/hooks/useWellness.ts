import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pet, WeightEntry, BehaviorEntry } from '@/core/entities/pet'

export function useWellness() {
    const supabase = createClient()
    const [pets, setPets] = useState<Pet[]>([])
    const [selectedPetId, setSelectedPetId] = useState<string>('')
    const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([])
    const [behaviorHistory, setBehaviorHistory] = useState<BehaviorEntry[]>([])
    const [loading, setLoading] = useState(true)

    const fetchInitial = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: petsData } = await supabase.from('pets').select('id, name, species').eq('owner_id', user.id)
        if (petsData && petsData.length > 0) {
            setPets(petsData)
            setSelectedPetId(petsData[0].id)
        }
        setLoading(false)
    }

    const fetchPetData = async (petId: string) => {
        const { data: weight } = await supabase.from('pet_weight_history').select('*').eq('pet_id', petId).order('recorded_at', { ascending: false })
        const { data: behavior } = await supabase.from('pet_behavior_logs').select('*').eq('pet_id', petId).order('recorded_at', { ascending: false })
        setWeightHistory(weight || [])
        setBehaviorHistory(behavior || [])
    }

    useEffect(() => {
        fetchInitial()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (selectedPetId) fetchPetData(selectedPetId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPetId])

    const addWeight = async (weight: number) => {
        if (!selectedPetId) return { error: 'No pet selected' }
        const { error } = await supabase.from('pet_weight_history').insert({
            pet_id: selectedPetId, weight_kg: weight
        })
        if (!error) fetchPetData(selectedPetId)
        return { error }
    }

    const addBehavior = async (mood: string, energy: number, notes: string) => {
        if (!selectedPetId) return { error: 'No pet selected' }
        const { error } = await supabase.from('pet_behavior_logs').insert({
            pet_id: selectedPetId, mood: mood, energy_level: energy, notes: notes || null
        })
        if (!error) fetchPetData(selectedPetId)
        return { error }
    }

    return {
        pets,
        selectedPetId,
        setSelectedPetId,
        weightHistory,
        behaviorHistory,
        loading,
        addWeight,
        addBehavior
    }
}
