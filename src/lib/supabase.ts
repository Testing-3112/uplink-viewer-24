import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Video {
  id: string;
  title: string;
  poster: string;
  downloadLink: string;
  embedLink: string;
}

export interface Collection {
  id?: string;
  videos: Video[];
  folderName: string;
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
}