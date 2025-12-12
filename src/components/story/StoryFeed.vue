<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import type { HNStory, FeedType } from "@/lib/hn-client";
import { getStories } from "@/lib/hn-client";
import { useVimKeyboard } from "@/composables/useVimKeyboard";
import { useBookmarks } from "@/composables/useBookmarks";
import { useReadHistory } from "@/composables/useReadHistory";
import { useTheme } from "@/composables/useTheme";
import { useDensity } from "@/composables/useDensity";
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
const showHelpModal = ref(false);

const basePath = import.meta.env.BASE_URL || "/";

const { toggleBookmark } = useBookmarks();
const { markAsRead } = useReadHistory();
const { toggleTheme } = useTheme();
const { toggleDensity } = useDensity();

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
  selectedIndex.value = 0;
  fetchStories(0);
};

const selectedStory = computed(
  () => stories.value[selectedIndex.value] || null,
);

// Scroll selected element into view
const scrollToSelected = (behavior: ScrollBehavior = "smooth") => {
  const element = document.querySelector(
    `[data-story-index="${selectedIndex.value}"]`,
  );
  element?.scrollIntoView({ behavior, block: "nearest" });
};

// Navigate with count support
const navigateToSelected = (direction: "up" | "down", count: number = 1) => {
  if (direction === "down") {
    selectedIndex.value = Math.min(
      selectedIndex.value + count,
      stories.value.length - 1,
    );
  } else {
    selectedIndex.value = Math.max(selectedIndex.value - count, 0);
  }
  scrollToSelected();
};

// Jump to first item (gg)
const jumpToFirst = () => {
  selectedIndex.value = 0;
  scrollToSelected();
};

// Jump to last item (G)
const jumpToLast = () => {
  selectedIndex.value = Math.max(0, stories.value.length - 1);
  scrollToSelected();
};

// Jump to screen position (H/M/L)
const jumpToPosition = (position: "top" | "middle" | "bottom") => {
  const container = document.querySelector(".story-list");
  if (!container) return;

  const storyElements = container.querySelectorAll("[data-story-index]");
  const visibleStories: number[] = [];

  storyElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    if (rect.top >= 0 && rect.bottom <= viewportHeight) {
      const index = parseInt(el.getAttribute("data-story-index") || "0", 10);
      visibleStories.push(index);
    }
  });

  if (visibleStories.length === 0) return;

  switch (position) {
    case "top":
      selectedIndex.value = visibleStories[0];
      break;
    case "middle":
      selectedIndex.value = visibleStories[Math.floor(visibleStories.length / 2)];
      break;
    case "bottom":
      selectedIndex.value = visibleStories[visibleStories.length - 1];
      break;
  }
  scrollToSelected("auto");
};

// Page scroll (Ctrl+d/Ctrl+u)
const pageScroll = (direction: "up" | "down") => {
  const scrollAmount = window.innerHeight / 2;
  window.scrollBy({
    top: direction === "down" ? scrollAmount : -scrollAmount,
    behavior: "smooth",
  });
};

// Center selected item (zz)
const centerSelected = () => {
  const element = document.querySelector(
    `[data-story-index="${selectedIndex.value}"]`,
  );
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
};

const openSelectedStory = () => {
  const story = selectedStory.value;
  if (story) {
    markAsRead(story.id);
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
    markAsRead(story.id);
    window.location.href = `${basePath}item/${story.id}`;
  }
};

const bookmarkSelected = async () => {
  const story = selectedStory.value;
  if (story) {
    await toggleBookmark(story);
  }
};

const markSelectedAsRead = () => {
  const story = selectedStory.value;
  if (story) {
    markAsRead(story.id);
  }
};

const openUserProfile = () => {
  const story = selectedStory.value;
  if (story?.by) {
    window.location.href = `${basePath}user/${story.by}`;
  }
};

const yankUrl = (type: "story" | "comments") => {
  const story = selectedStory.value;
  if (!story) return;

  let url: string;
  if (type === "story" && story.url) {
    url = story.url;
  } else {
    url = `${window.location.origin}${basePath}item/${story.id}`;
  }

  navigator.clipboard.writeText(url).then(() => {
    // Could show a toast here
    console.log(`Copied ${type} URL to clipboard`);
  });
};

const goToDestination = (destination: string) => {
  window.location.href = `${basePath}${destination.replace(/^\//, "")}`;
};

const handleSearch = () => {
  // Placeholder for search modal - will be implemented with Algolia
  // For now, emit an event or show a message
  console.log("Search triggered - Algolia integration pending");
};

const goBack = () => {
  window.history.back();
};

const toggleHelpModal = () => {
  showHelpModal.value = !showHelpModal.value;
};

// Vim keyboard navigation
const { pendingSequence } = useVimKeyboard({
  context: "feed",
  onNavigate: navigateToSelected,
  onJumpToFirst: jumpToFirst,
  onJumpToLast: jumpToLast,
  onJumpToPosition: jumpToPosition,
  onPageScroll: pageScroll,
  onCenterSelected: centerSelected,
  onOpen: openSelectedStory,
  onOpenComments: openSelectedComments,
  onBookmark: bookmarkSelected,
  onMarkAsRead: markSelectedAsRead,
  onRefresh: refresh,
  onOpenUserProfile: openUserProfile,
  onYankUrl: yankUrl,
  onGoTo: goToDestination,
  onSearch: handleSearch,
  onToggleTheme: toggleTheme,
  onToggleDensity: toggleDensity,
  onShowHelp: toggleHelpModal,
  onNextPage: loadMore,
  onBack: goBack,
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

// Expose for help modal
defineExpose({ showHelpModal });
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

    <!-- Pending sequence indicator -->
    <div v-if="pendingSequence" class="pending-sequence">
      {{ pendingSequence }}
    </div>

    <!-- Keyboard hints -->
    <div class="keyboard-hints">
      <span><kbd>j</kbd>/<kbd>k</kbd> navigate</span>
      <span><kbd>o</kbd> open</span>
      <span><kbd>c</kbd> comments</span>
      <span><kbd>b</kbd> bookmark</span>
      <span><kbd>?</kbd> help</span>
    </div>

    <!-- Keyboard Help Modal -->
    <Teleport to="body">
      <div v-if="showHelpModal" class="help-modal-overlay" @click.self="toggleHelpModal">
        <div class="help-modal">
          <div class="help-modal-header">
            <h2>Keyboard Shortcuts</h2>
            <button class="help-modal-close" @click="toggleHelpModal">&times;</button>
          </div>
          <div class="help-modal-content">
            <div class="shortcut-section">
              <h3>Navigation</h3>
              <div class="shortcut-grid">
                <div class="shortcut"><kbd>j</kbd> / <kbd>k</kbd><span>Next / Previous item</span></div>
                <div class="shortcut"><kbd>5j</kbd> / <kbd>5k</kbd><span>Move 5 items</span></div>
                <div class="shortcut"><kbd>gg</kbd><span>Jump to first</span></div>
                <div class="shortcut"><kbd>G</kbd><span>Jump to last</span></div>
                <div class="shortcut"><kbd>H</kbd> / <kbd>M</kbd> / <kbd>L</kbd><span>Top / Middle / Bottom of screen</span></div>
                <div class="shortcut"><kbd>Ctrl+d</kbd> / <kbd>Ctrl+u</kbd><span>Half page down / up</span></div>
                <div class="shortcut"><kbd>zz</kbd><span>Center selected</span></div>
                <div class="shortcut"><kbd>[</kbd> / <kbd>]</kbd><span>Prev / Next page</span></div>
              </div>
            </div>
            <div class="shortcut-section">
              <h3>Actions</h3>
              <div class="shortcut-grid">
                <div class="shortcut"><kbd>o</kbd> / <kbd>Enter</kbd><span>Open story link</span></div>
                <div class="shortcut"><kbd>c</kbd><span>Open comments</span></div>
                <div class="shortcut"><kbd>b</kbd><span>Toggle bookmark</span></div>
                <div class="shortcut"><kbd>m</kbd><span>Mark as read</span></div>
                <div class="shortcut"><kbd>r</kbd><span>Refresh feed</span></div>
                <div class="shortcut"><kbd>u</kbd><span>View author profile</span></div>
                <div class="shortcut"><kbd>y</kbd> / <kbd>Y</kbd><span>Copy story / comments URL</span></div>
                <div class="shortcut"><kbd>t</kbd><span>Toggle theme</span></div>
                <div class="shortcut"><kbd>d</kbd><span>Toggle density</span></div>
                <div class="shortcut"><kbd>/</kbd><span>Search (coming soon)</span></div>
              </div>
            </div>
            <div class="shortcut-section">
              <h3>Go To</h3>
              <div class="shortcut-grid">
                <div class="shortcut"><kbd>gt</kbd> / <kbd>gh</kbd><span>Top stories</span></div>
                <div class="shortcut"><kbd>gn</kbd><span>New stories</span></div>
                <div class="shortcut"><kbd>ga</kbd><span>Ask HN</span></div>
                <div class="shortcut"><kbd>gs</kbd><span>Show HN</span></div>
                <div class="shortcut"><kbd>gj</kbd><span>Jobs</span></div>
                <div class="shortcut"><kbd>gb</kbd><span>Bookmarks</span></div>
                <div class="shortcut"><kbd>gu</kbd><span>User profile</span></div>
              </div>
            </div>
            <div class="shortcut-section">
              <h3>Other</h3>
              <div class="shortcut-grid">
                <div class="shortcut"><kbd>Esc</kbd><span>Go back / Cancel sequence</span></div>
                <div class="shortcut"><kbd>?</kbd><span>Show this help</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
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

/* Pending sequence indicator */
.pending-sequence {
  position: fixed;
  bottom: var(--spacing-16);
  left: 50%;
  transform: translateX(-50%);
  padding: var(--spacing-2) var(--spacing-4);
  background-color: var(--accent);
  color: white;
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: 600;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  animation: pulse 0.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { opacity: 0.8; }
  to { opacity: 1; }
}

/* Help modal */
.help-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(4px);
}

.help-modal {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 700px;
  max-height: 80vh;
  width: 90%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.help-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--border-default);
}

.help-modal-header h2 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.help-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color var(--transition-fast);
}

.help-modal-close:hover {
  color: var(--text-primary);
}

.help-modal-content {
  padding: var(--spacing-4) var(--spacing-6);
  overflow-y: auto;
}

.shortcut-section {
  margin-bottom: var(--spacing-6);
}

.shortcut-section:last-child {
  margin-bottom: 0;
}

.shortcut-section h3 {
  margin: 0 0 var(--spacing-3);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-2);
}

.shortcut {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
}

.shortcut:hover {
  background-color: var(--bg-tertiary);
}

.shortcut kbd {
  display: inline-block;
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: 4px;
  color: var(--text-primary);
  min-width: 20px;
  text-align: center;
}

.shortcut span {
  color: var(--text-secondary);
  flex: 1;
}

@media (max-width: 640px) {
  .help-modal {
    max-height: 90vh;
    width: 95%;
  }

  .shortcut-grid {
    grid-template-columns: 1fr;
  }

  .pending-sequence {
    bottom: var(--spacing-8);
  }
}
</style>
