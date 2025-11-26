import { ref, onMounted } from 'vue';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getLocalStorage, setLocalStorage } from '@/lib/utils';

const STORAGE_KEY = 'hackernew-read';
const MAX_LOCAL_HISTORY = 500;

// Shared state
const readStories = ref<Set<string>>(new Set());
const userId = ref<string | null>(null);

export function useReadHistory() {
  const isRead = (storyId: number | string): boolean => {
    return readStories.value.has(String(storyId));
  };

  const markAsRead = async (storyId: number | string) => {
    const storyIdStr = String(storyId);

    if (readStories.value.has(storyIdStr)) return;

    // Update local state
    readStories.value.add(storyIdStr);
    saveToLocalStorage();

    // Sync with Supabase if logged in
    if (userId.value && isSupabaseConfigured()) {
      try {
        await supabase.from('read_stories').upsert({
          user_id: userId.value,
          story_id: storyIdStr,
        } as never);
      } catch (error) {
        console.error('Error syncing read status:', error);
      }
    }
  };

  const clearHistory = () => {
    readStories.value.clear();
    saveToLocalStorage();
  };

  const saveToLocalStorage = () => {
    // Keep only the most recent entries
    const entries = Array.from(readStories.value);
    const trimmed = entries.slice(-MAX_LOCAL_HISTORY);
    setLocalStorage(STORAGE_KEY, trimmed);
  };

  const loadFromLocalStorage = () => {
    const data = getLocalStorage<string[]>(STORAGE_KEY, []);
    readStories.value = new Set(data);
  };

  const loadFromSupabase = async () => {
    if (!userId.value || !isSupabaseConfigured()) return;

    try {
      const { data, error } = await supabase
        .from('read_stories')
        .select('story_id')
        .eq('user_id', userId.value)
        .order('read_at', { ascending: false })
        .limit(MAX_LOCAL_HISTORY);

      if (error) throw error;

      if (data) {
        (data as unknown as { story_id: string }[]).forEach((item) => {
          readStories.value.add(item.story_id);
        });
        saveToLocalStorage();
      }
    } catch (error) {
      console.error('Error loading read history:', error);
    }
  };

  const setUserId = (id: string | null) => {
    userId.value = id;
    if (id) {
      loadFromSupabase();
    }
  };

  onMounted(() => {
    loadFromLocalStorage();
  });

  return {
    readStories,
    isRead,
    markAsRead,
    clearHistory,
    setUserId,
  };
}
