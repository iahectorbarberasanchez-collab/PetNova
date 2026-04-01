export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  pet_coins: number;
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Bird' | 'Fish' | 'Rabbit' | 'Hamster' | 'Reptile' | 'Other';
  breed: string | null;
  birth_date: string | null;
  weight_kg: number | null;
  avatar_url: string | null;
  created_at: string;
}

export interface HealthRecord {
  id: string;
  pet_id: string;
  title: string;
  record_type: 'Vaccine' | 'Deworming' | 'Checkup' | 'Surgery' | 'Other';
  notes: string | null;
  date_administered: string;
  next_due_date: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  pet_id: string | null;
  caption: string | null;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  pet?: { name: string; species: string; avatar_url: string | null } | null;
  profile?: { display_name: string | null } | null;
  liked_by_me?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: { display_name: string | null } | null;
}

export interface PetSpeciesProfile {
  id: string;
  pet_id: string;
  species_category: string;
  specific_data: Record<string, any>;
  habitat_notes: string | null;
  dietary_requirements: string | null;
  created_at: string;
  updated_at: string;
}

export interface CareEvent {
  id: string;
  pet_id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_type: 'feeding' | 'cleaning' | 'medication' | 'exercise' | 'checkup' | 'other';
  start_time: string;
  end_time: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  is_completed: boolean;
  created_at: string;
}

export interface FoodEntry {
  id: string;
  pet_id: string;
  user_id: string;
  entry_date: string;
  food_type: string;
  brand: string | null;
  amount_grams: number | null;
  calories: number | null;
  notes: string | null;
  created_at: string;
}

export interface WeightEntry {
  id: string;
  pet_id: string;
  user_id: string;
  check_date: string;
  weight_kg: number;
  body_condition_score: number | null;
  notes: string | null;
  created_at: string;
}

export interface BehaviorLog {
  id: string;
  pet_id: string;
  user_id: string;
  log_date: string;
  wellbeing_score: number;
  activity_level: number;
  appetite_level: number;
  sleep_quality: number;
  sociability: number;
  symptoms: string[];
  mood_emoji: string | null;
  notes: string | null;
  created_at: string;
}

export interface BreedingRecord {
  id: string;
  pet_id: string;
  user_id: string;
  record_type: 'heat_cycle' | 'mating' | 'gestation' | 'birth' | 'litter_individual';
  start_date: string;
  end_date: string | null;
  expected_birth_date: string | null;
  partner_pet_name: string | null;
  litter_size: number | null;
  notes: string | null;
  parent_record_id: string | null;
  created_at: string;
}

export interface FirstAidArticle {
  id: string;
  slug: string;
  title: string;
  species: string[];
  symptom: string;
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
  summary: string;
  steps: Array<{ step: number; title: string; description: string; warning?: string }>;
  when_to_call_vet: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpeciesWikiEntry {
  id: string;
  slug: string;
  name: string;
  scientific_name: string | null;
  category: 'dog' | 'cat' | 'bird' | 'reptile' | 'fish' | 'rabbit' | 'rodent' | 'exotic';
  origin: string | null;
  avg_lifespan_years: number | null;
  avg_weight_kg_min: number | null;
  avg_weight_kg_max: number | null;
  avg_size_cm_min: number | null;
  avg_size_cm_max: number | null;
  character_traits: string[];
  common_diseases: string[];
  exercise_needs: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  care_difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  good_with_children: boolean | null;
  good_with_other_pets: boolean | null;
  description: string | null;
  care_tips: string | null;
  diet_info: string | null;
  cover_image_url: string | null;
  community_rating: number;
  community_ratings_count: number;
  is_published: boolean;
  created_at: string;
}
