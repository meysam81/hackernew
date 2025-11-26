import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Database types
export interface Profile {
  id: string;
  username: string | null;
  karma: number;
  email_digest: boolean;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  story_id: string;
  story_title: string | null;
  story_url: string | null;
  created_at: string;
}

export interface ReadStory {
  user_id: string;
  story_id: string;
  read_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'karma' | 'created_at'> & { karma?: number; created_at?: string };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      bookmarks: {
        Row: Bookmark;
        Insert: Omit<Bookmark, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Bookmark, 'id' | 'user_id'>>;
      };
      read_stories: {
        Row: ReadStory;
        Insert: Omit<ReadStory, 'read_at'> & { read_at?: string };
        Update: Partial<Omit<ReadStory, 'user_id' | 'story_id'>>;
      };
    };
  };
}

// Environment variables with fallbacks for build time
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Create client - will be properly configured at runtime
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return (
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-key'
  );
};

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper to get user profile
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};
