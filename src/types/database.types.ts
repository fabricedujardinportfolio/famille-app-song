export interface Song {
  id: string;
  user_id: string;
  title: string;
  lyrics: string;
  starting_note: string;
  scroll_speed: 'slow' | 'medium' | 'fast';
  created_at: string;
  updated_at: string;
}

export interface SongFormData {
  title: string;
  lyrics: string;
  starting_note: string;
  scroll_speed: 'slow' | 'medium' | 'fast';
}