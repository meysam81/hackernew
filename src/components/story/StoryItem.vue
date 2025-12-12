<script setup lang="ts">
import { computed } from "vue";
import {
  ChevronUp,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
} from "lucide-vue-next";
import type { HNStory } from "@/lib/hn-client";
import { getDomain } from "@/lib/hn-client";
import { timeAgo, formatDate, pluralize } from "@/lib/utils";
import { useBookmarks } from "@/composables/useBookmarks";
import { useReadHistory } from "@/composables/useReadHistory";

interface Props {
  story: HNStory;
  rank?: number;
  showUpvote?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showUpvote: true,
});

const emit = defineEmits<{
  (e: "click", story: HNStory): void;
}>();

const { isBookmarked, toggleBookmark } = useBookmarks();
const { isRead, markAsRead } = useReadHistory();

const domain = computed(() => getDomain(props.story.url));
const timeAgoStr = computed(() => timeAgo(props.story.time));
const formattedDate = computed(() => formatDate(props.story.time));
const commentCount = computed(() => props.story.descendants || 0);
const isStoryBookmarked = computed(() => isBookmarked(props.story.id));
const isStoryRead = computed(() => isRead(props.story.id));

const basePath = import.meta.env.BASE_URL || "/";

const handleTitleClick = () => {
  markAsRead(props.story.id);
  emit("click", props.story);
};

const handleBookmarkClick = async (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  await toggleBookmark(props.story);
};
</script>

<template>
  <article class="story-item" :class="{ 'story-read': isStoryRead }">
    <div class="story-rank" v-if="rank">{{ rank }}.</div>

    <div class="story-vote" v-if="showUpvote">
      <button class="upvote-btn" aria-label="Upvote">
        <ChevronUp :size="18" />
      </button>
    </div>

    <div class="story-content">
      <div class="story-title-row">
        <a
          v-if="story.url"
          :href="story.url"
          class="story-title"
          target="_blank"
          rel="noopener noreferrer"
          @click="handleTitleClick"
        >
          {{ story.title }}
          <ExternalLink :size="12" class="external-icon" />
        </a>
        <a
          v-else
          :href="`${basePath}item/${story.id}`"
          class="story-title"
          @click="handleTitleClick"
        >
          {{ story.title }}
        </a>

        <span v-if="domain" class="story-domain"> ({{ domain }}) </span>
      </div>

      <div class="story-meta">
        <span class="story-score"
          >{{ story.score }} {{ story.score === 1 ? "point" : "points" }}</span
        >
        <span class="meta-sep">·</span>
        <a :href="`${basePath}user/${story.by}`" class="story-author">{{
          story.by
        }}</a>
        <span class="meta-sep">·</span>
        <span class="story-time" :title="formattedDate">{{ timeAgoStr }}</span>
        <span class="meta-sep">·</span>
        <a
          :href="`${basePath}item/${story.id}`"
          class="story-comments"
        >
          <MessageSquare :size="12" />
          {{ pluralize(commentCount, "comment") }}
        </a>

        <button
          class="bookmark-btn"
          :class="{ bookmarked: isStoryBookmarked }"
          :aria-label="isStoryBookmarked ? 'Remove bookmark' : 'Add bookmark'"
          @click="handleBookmarkClick"
        >
          <BookmarkCheck v-if="isStoryBookmarked" :size="14" />
          <Bookmark v-else :size="14" />
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.story-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  padding: var(--spacing-3) 0;
  border-bottom: 1px solid var(--border-subtle);
  transition: background-color var(--transition-fast);
}

.story-item:hover {
  background-color: var(--bg-tertiary);
  margin: 0 calc(-1 * var(--spacing-2));
  padding-left: var(--spacing-2);
  padding-right: var(--spacing-2);
  border-radius: var(--radius-sm);
}

.story-read .story-title {
  color: var(--text-tertiary);
}

.story-rank {
  min-width: 28px;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  text-align: right;
}

.story-vote {
  display: flex;
  align-items: center;
}

.upvote-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast);
}

.upvote-btn:hover {
  color: var(--accent);
  background-color: var(--accent-muted);
}

.story-content {
  flex: 1;
  min-width: 0;
}

.story-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-1);
}

.story-title {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}

.story-title:hover {
  color: var(--accent);
}

.external-icon {
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.story-title:hover .external-icon {
  opacity: 0.5;
}

.story-domain {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.story-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-1);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.meta-sep {
  color: var(--text-tertiary);
}

.story-author,
.story-comments {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.story-author:hover,
.story-comments:hover {
  color: var(--accent);
}

.story-comments {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.story-time {
  color: var(--text-tertiary);
}

.bookmark-btn {
  display: inline-flex;
  align-items: center;
  margin-left: var(--spacing-2);
  padding: 2px;
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  opacity: 0;
  transition:
    opacity var(--transition-fast),
    color var(--transition-fast);
}

.story-item:hover .bookmark-btn {
  opacity: 1;
}

.bookmark-btn:hover {
  color: var(--accent);
}

.bookmark-btn.bookmarked {
  opacity: 1;
  color: var(--accent);
}

@media (max-width: 640px) {
  .story-rank {
    display: none;
  }

  .bookmark-btn {
    opacity: 1;
  }
}
</style>
