import { ref, onMounted } from 'vue';
import { supabase, isSupabaseConfigured, type Profile } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

// Shared state across components
const user = ref<User | null>(null);
const profile = ref<Profile | null>(null);
const loading = ref(true);
const isConfigured = ref(false);

export function useAuth() {
  const signInWithGitHub = async () => {
    if (!isConfigured.value) {
      console.warn('Supabase not configured');
      return { error: new Error('Supabase not configured') };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}auth/callback`,
      },
    });

    return { error };
  };

  const signInWithGoogle = async () => {
    if (!isConfigured.value) {
      console.warn('Supabase not configured');
      return { error: new Error('Supabase not configured') };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}auth/callback`,
      },
    });

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      user.value = null;
      profile.value = null;
    }
    return { error };
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user.value) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates as never)
      .eq('id', user.value.id)
      .select()
      .single();

    if (!error && data) {
      profile.value = data as unknown as Profile;
    }

    return { data, error };
  };

  const handleAuthChange = async (session: Session | null) => {
    if (session?.user) {
      user.value = session.user;
      profile.value = await fetchProfile(session.user.id);
    } else {
      user.value = null;
      profile.value = null;
    }
  };

  const initAuth = async () => {
    isConfigured.value = isSupabaseConfigured();

    if (!isConfigured.value) {
      loading.value = false;
      return;
    }

    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      await handleAuthChange(session);

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        await handleAuthChange(session);
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    initAuth();
  });

  return {
    user,
    profile,
    loading,
    isConfigured,
    signInWithGitHub,
    signInWithGoogle,
    signOut,
    updateProfile,
  };
}
