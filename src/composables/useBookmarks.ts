import { ref, computed, onMounted, watch } from "vue";
import { supabase, isSupabaseConfigured, type Bookmark } from "@/lib/supabase";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";
import type { HNStory } from "@/lib/hn-client";
import log from "@/utils/logger";

const STORAGE_KEY = "hackernew-bookmarks";

interface LocalBookmark {
  storyId: string;
  storyTitle: string;
  storyUrl: string | null;
  createdAt: string;
}

// Shared state
const bookmarks = ref<Map<string, LocalBookmark>>(new Map());
const loading = ref(true);
const userId = ref<string | null>(null);

export function useBookmarks() {
  const bookmarkList = computed(() => Array.from(bookmarks.value.values()));
  const bookmarkCount = computed(() => bookmarks.value.size);

  const isBookmarked = (storyId: number | string): boolean => {
    return bookmarks.value.has(String(storyId));
  };

  const addBookmark = async (story: HNStory) => {
    const storyIdStr = String(story.id);
    const bookmark: LocalBookmark = {
      storyId: storyIdStr,
      storyTitle: story.title,
      storyUrl: story.url || null,
      createdAt: new Date().toISOString(),
    };

    // Update local state immediately
    bookmarks.value.set(storyIdStr, bookmark);
    saveToLocalStorage();

    // Sync with Supabase if logged in
    if (userId.value && isSupabaseConfigured()) {
      try {
        await supabase.from("bookmarks").insert({
          user_id: userId.value,
          story_id: storyIdStr,
          story_title: story.title,
          story_url: story.url || null,
        } as never);
      } catch (error) {
        log.error("Failed to add bookmark to Supabase:", error);
      }
    }
  };

  const removeBookmark = async (storyId: number | string) => {
    const storyIdStr = String(storyId);

    // Update local state immediately
    bookmarks.value.delete(storyIdStr);
    saveToLocalStorage();

    // Sync with Supabase if logged in
    if (userId.value && isSupabaseConfigured()) {
      try {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", userId.value)
          .eq("story_id", storyIdStr);
      } catch (error) {
        log.error("Failed to remove bookmark from Supabase:", error);
      }
    }
  };

  const toggleBookmark = async (story: HNStory) => {
    if (isBookmarked(story.id)) {
      await removeBookmark(story.id);
    } else {
      await addBookmark(story);
    }
  };

  const saveToLocalStorage = () => {
    const data = Array.from(bookmarks.value.entries());
    setLocalStorage(STORAGE_KEY, data);
  };

  const loadFromLocalStorage = () => {
    const data = getLocalStorage<[string, LocalBookmark][]>(STORAGE_KEY, []);
    bookmarks.value = new Map(data);
  };

  const loadFromSupabase = async () => {
    if (!userId.value || !isSupabaseConfigured()) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId.value)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Merge Supabase bookmarks with local
      if (data) {
        (data as unknown as Bookmark[]).forEach((b) => {
          bookmarks.value.set(b.story_id, {
            storyId: b.story_id,
            storyTitle: b.story_title || "",
            storyUrl: b.story_url,
            createdAt: b.created_at,
          });
        });
        saveToLocalStorage();
      }
    } catch (error) {
      log.error("Failed to load bookmarks from Supabase:", error);
    }
  };

  const setUserId = (id: string | null) => {
    userId.value = id;
    if (id) {
      loadFromSupabase();
    }
  };

  const initBookmarks = () => {
    loadFromLocalStorage();
    loading.value = false;
  };

  onMounted(() => {
    initBookmarks();
  });

  // Watch for user changes to sync bookmarks
  watch(userId, (newId) => {
    if (newId) {
      loadFromSupabase();
    }
  });

  return {
    bookmarks,
    bookmarkList,
    bookmarkCount,
    loading,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    setUserId,
  };
}
