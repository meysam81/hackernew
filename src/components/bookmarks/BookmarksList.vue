<script setup lang="ts">
import { computed } from 'vue';
import { Bookmark, Trash2, ExternalLink } from 'lucide-vue-next';
import { useBookmarks } from '@/composables/useBookmarks';
import { timeAgo } from '@/lib/utils';

const { bookmarkList, loading, removeBookmark } = useBookmarks();

const basePath = import.meta.env.BASE_URL || '/';

const sortedBookmarks = computed(() => {
  return [...bookmarkList.value].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
});

const handleRemove = async (storyId: string) => {
  await removeBookmark(storyId);
};
</script>

<template>
  <div class="bookmarks-list">
    <!-- Loading -->
    <div v-if="loading" class="bookmarks-loading">
      <p>Loading bookmarks...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="sortedBookmarks.length === 0" class="bookmarks-empty">
      <div class="empty-icon">
        <Bookmark :size="48" />
      </div>
      <h2>No bookmarks yet</h2>
      <p>Save stories by clicking the bookmark icon on any story.</p>
      <a :href="basePath" class="browse-link">Browse stories</a>
    </div>

    <!-- Bookmarks -->
    <div v-else class="bookmarks">
      <div
        v-for="bookmark in sortedBookmarks"
        :key="bookmark.storyId"
        class="bookmark-item"
      >
        <div class="bookmark-content">
          <a
            v-if="bookmark.storyUrl"
            :href="bookmark.storyUrl"
            class="bookmark-title"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ bookmark.storyTitle }}
            <ExternalLink :size="12" class="external-icon" />
          </a>
          <a
            v-else
            :href="`${basePath}item/${bookmark.storyId}`"
            class="bookmark-title"
          >
            {{ bookmark.storyTitle }}
          </a>

          <div class="bookmark-meta">
            <a :href="`${basePath}item/${bookmark.storyId}`" class="view-comments">
              View discussion
            </a>
            <span class="meta-sep">·</span>
            <span class="bookmark-time">Saved {{ timeAgo(new Date(bookmark.createdAt).getTime() / 1000) }}</span>
          </div>
        </div>

        <button
          class="remove-btn"
          title="Remove bookmark"
          @click="handleRemove(bookmark.storyId)"
        >
          <Trash2 :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bookmarks-loading {
  text-align: center;
  padding: var(--spacing-8);
  color: var(--text-secondary);
}

.bookmarks-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-12) var(--spacing-4);
  text-align: center;
}

.empty-icon {
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-4);
}

.bookmarks-empty h2 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-2);
}

.bookmarks-empty p {
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-4);
}

.browse-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
}

.browse-link:hover {
  text-decoration: underline;
}

.bookmarks {
  display: flex;
  flex-direction: column;
}

.bookmark-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-3);
  padding: var(--spacing-3) 0;
  border-bottom: 1px solid var(--border-subtle);
}

.bookmark-item:hover {
  background-color: var(--bg-tertiary);
  margin: 0 calc(-1 * var(--spacing-2));
  padding-left: var(--spacing-2);
  padding-right: var(--spacing-2);
  border-radius: var(--radius-sm);
}

.bookmark-content {
  flex: 1;
  min-width: 0;
}

.bookmark-title {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.bookmark-title:hover {
  color: var(--accent);
}

.external-icon {
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.bookmark-title:hover .external-icon {
  opacity: 0.5;
}

.bookmark-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  margin-top: var(--spacing-1);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.meta-sep {
  color: var(--text-tertiary);
}

.view-comments {
  color: var(--text-secondary);
  text-decoration: none;
}

.view-comments:hover {
  color: var(--accent);
}

.bookmark-time {
  color: var(--text-tertiary);
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  opacity: 0;
  transition: all var(--transition-fast);
}

.bookmark-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}
</style>
