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
