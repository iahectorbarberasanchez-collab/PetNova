export interface WeightEntry {
    id: string;
    pet_id: string;
    weight_kg: number;
    recorded_at: string;
}

export interface BehaviorEntry {
    id: string;
    pet_id: string;
    mood: string;
    energy_level: number;
    notes: string | null;
    recorded_at: string;
}

export interface Pet {
    id: string;
    name: string;
    species: string;
}

export const MOODS = [
    { emoji: '🤩', label: 'Eufórico', value: 'Excellent' },
    { emoji: '😊', label: 'Feliz', value: 'Good' },
    { emoji: '😐', label: 'Normal', value: 'Neutral' },
    { emoji: '😔', label: 'Triste', value: 'Sad' },
    { emoji: '🤒', label: 'Enfermito', value: 'Sick' },
] as const;

export type MoodValue = typeof MOODS[number]['value'];
