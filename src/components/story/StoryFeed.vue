<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import type { HNStory, FeedType } from "@/lib/hn-client";
import { getStories } from "@/lib/hn-client";
import { useKeyboard } from "@/composables/useKeyboard";
import { useBookmarks } from "@/composables/useBookmarks";
import StoryItem from "./StoryItem.vue";
import StoryListSkeleton from "./StoryListSkeleton.vue";

interface Props {
  feedType: FeedType;
  pageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 30,
});

const stories = ref<HNStory[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const error = ref<string | null>(null);
const currentPage = ref(0);
const hasMore = ref(true);
const selectedIndex = ref(0);

const basePath = import.meta.env.BASE_URL || "/";

const { toggleBookmark } = useBookmarks();

const fetchStories = async (page: number = 0) => {
  try {
    if (page === 0) {
      loading.value = true;
      error.value = null;
    } else {
      loadingMore.value = true;
    }

    const offset = page * props.pageSize;
    const newStories = await getStories(props.feedType, props.pageSize, offset);

    if (page === 0) {
      stories.value = newStories;
    } else {
      stories.value = [...stories.value, ...newStories];
    }

    hasMore.value = newStories.length === props.pageSize;
    currentPage.value = page;
  } catch (err) {
    error.value = "Failed to load stories. Please try again.";
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = () => {
  if (!loadingMore.value && hasMore.value) {
    fetchStories(currentPage.value + 1);
  }
};

const refresh = () => {
  fetchStories(0);
};

const selectedStory = computed(
  () => stories.value[selectedIndex.value] || null,
);

const navigateToSelected = (direction: "up" | "down") => {
  if (direction === "down") {
    selectedIndex.value = Math.min(
      selectedIndex.value + 1,
      stories.value.length - 1,
    );
  } else {
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
  }

  // Scroll into view
  const element = document.querySelector(
    `[data-story-index="${selectedIndex.value}"]`,
  );
  element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

const openSelectedStory = () => {
  const story = selectedStory.value;
  if (story) {
    if (story.url) {
      window.open(story.url, "_blank");
    } else {
      window.location.href = `${basePath}item/${story.id}`;
    }
  }
};

const openSelectedComments = () => {
  const story = selectedStory.value;
  if (story) {
    window.location.href = `${basePath}item/${story.id}`;
  }
};

const bookmarkSelected = async () => {
  const story = selectedStory.value;
  if (story) {
    await toggleBookmark(story);
  }
};

// Keyboard navigation
useKeyboard({
  onNavigate: navigateToSelected,
  onOpen: openSelectedStory,
  onOpenComments: openSelectedComments,
  onBookmark: bookmarkSelected,
});

onMounted(() => {
  fetchStories(0);
});

// Watch for feed type changes
watch(
  () => props.feedType,
  () => {
    selectedIndex.value = 0;
    fetchStories(0);
  },
);
</script>

<template>
  <div class="story-feed">
    <!-- Loading skeleton -->
    <StoryListSkeleton v-if="loading" :count="10" />

    <!-- Error state -->
    <div v-else-if="error" class="feed-error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="refresh">Try again</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="stories.length === 0" class="feed-empty">
      <p>No stories found.</p>
    </div>

    <!-- Story list -->
    <template v-else>
      <div class="story-list">
        <div
          v-for="(story, index) in stories"
          :key="story.id"
          :data-story-index="index"
          :class="{ 'story-selected': index === selectedIndex }"
        >
          <StoryItem
            :story="story"
            :rank="index + 1"
            @click="() => {}"
          />
        </div>
      </div>

      <!-- Load more -->
      <div class="load-more" v-if="hasMore">
        <button class="load-more-btn" :disabled="loadingMore" @click="loadMore">
          {{ loadingMore ? "Loading..." : "Load more" }}
        </button>
      </div>
    </template>

    <!-- Keyboard hints -->
    <div class="keyboard-hints">
      <span><kbd>j</kbd>/<kbd>k</kbd> navigate</span>
      <span><kbd>o</kbd> open</span>
      <span><kbd>c</kbd> comments</span>
      <span><kbd>b</kbd> bookmark</span>
      <span><kbd>?</kbd> help</span>
    </div>
  </div>
</template>

<style scoped>
.story-feed {
  position: relative;
}

.story-list {
  display: flex;
  flex-direction: column;
}

.story-selected {
  background-color: var(--bg-tertiary);
  margin: 0 calc(-1 * var(--spacing-2));
  padding: 0 var(--spacing-2);
  border-radius: var(--radius-sm);
}

.feed-error,
.feed-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12) var(--spacing-4);
  text-align: center;
  color: var(--text-secondary);
}

.retry-btn {
  margin-top: var(--spacing-4);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--accent);
  background: none;
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.retry-btn:hover {
  background-color: var(--accent-muted);
}

.load-more {
  display: flex;
  justify-content: center;
  padding: var(--spacing-6) 0;
}

.load-more-btn {
  padding: var(--spacing-2) var(--spacing-6);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.load-more-btn:hover:not(:disabled) {
  color: var(--text-primary);
  border-color: var(--text-tertiary);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.keyboard-hints {
  position: fixed;
  bottom: var(--spacing-4);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-2) var(--spacing-4);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  box-shadow: var(--shadow-md);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.story-feed:focus-within .keyboard-hints,
.keyboard-hints:hover {
  opacity: 1;
}

kbd {
  display: inline-block;
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: 4px;
}

@media (max-width: 640px) {
  .keyboard-hints {
    display: none;
  }
}
</style>
