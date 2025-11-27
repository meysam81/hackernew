<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  ExternalLink,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
} from "lucide-vue-next";
import type { HNStory } from "@/lib/hn-client";
import { getStory, getDomain, getHNUrl } from "@/lib/hn-client";
import { timeAgo, formatDate, pluralize, sanitizeHtml } from "@/lib/utils";
import { useBookmarks } from "@/composables/useBookmarks";
import { useReadHistory } from "@/composables/useReadHistory";
import CommentThread from "../comment/CommentThread.vue";
import Skeleton from "../ui/Skeleton.vue";

interface Props {
  storyId: string;
}

const props = defineProps<Props>();

const story = ref<HNStory | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const { isBookmarked, toggleBookmark } = useBookmarks();
const { markAsRead } = useReadHistory();

const basePath = import.meta.env.BASE_URL || "/";

// Get the actual story ID from URL if we're on a placeholder page
const actualStoryId = computed(() => {
  if (props.storyId === "placeholder" && typeof window !== "undefined") {
    const pathParts = window.location.pathname.split("/");
    const idIndex = pathParts.indexOf("item") + 1;
    return pathParts[idIndex] || null;
  }
  return props.storyId;
});

const domain = computed(() => (story.value ? getDomain(story.value.url) : ""));
const timeAgoStr = computed(() =>
  story.value ? timeAgo(story.value.time) : "",
);
const formattedDate = computed(() =>
  story.value ? formatDate(story.value.time) : "",
);
const hnUrl = computed(() => (story.value ? getHNUrl(story.value.id) : ""));
const isStoryBookmarked = computed(() =>
  story.value ? isBookmarked(story.value.id) : false,
);
const storyText = computed(() =>
  story.value?.text ? sanitizeHtml(story.value.text) : "",
);

const fetchStory = async () => {
  const id = actualStoryId.value;
  if (!id) {
    error.value = "Invalid story ID";
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    const data = await getStory(parseInt(id, 10));
    if (!data) {
      throw new Error("Story not found");
    }

    story.value = data;
    markAsRead(data.id);
  } catch (err) {
    error.value = "Failed to load story.";
  } finally {
    loading.value = false;
  }
};

const handleBookmark = async () => {
  if (story.value) {
    await toggleBookmark(story.value);
  }
};

const handleShare = async () => {
  if (story.value && navigator.share) {
    try {
      await navigator.share({
        title: story.value.title,
        url: window.location.href,
      });
    } catch (err) {
      // User cancelled or error
    }
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href);
  }
};

onMounted(() => {
  fetchStory();
});
</script>

<template>
  <div class="story-detail">
    <a :href="basePath" class="back-link">
      <ArrowLeft :size="16" />
      Back to stories
    </a>

    <!-- Loading -->
    <div v-if="loading" class="story-loading">
      <Skeleton width="80%" height="32px" />
      <div class="meta-skeleton">
        <Skeleton width="60px" height="16px" />
        <Skeleton width="80px" height="16px" />
        <Skeleton width="100px" height="16px" />
      </div>
      <Skeleton width="100%" height="120px" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="story-error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchStory">Try again</button>
    </div>

    <!-- Story content -->
    <article v-else-if="story" class="story-content">
      <header class="story-header">
        <h1 class="story-title">{{ story.title }}</h1>

        <div class="story-meta">
          <span class="story-score"
            >{{ story.score }}
            {{ story.score === 1 ? "point" : "points" }}</span
          >
          <span class="meta-sep">·</span>
          <a :href="`${basePath}user/${story.by}`" class="story-author">{{
            story.by
          }}</a>
          <span class="meta-sep">·</span>
          <span class="story-time" :title="formattedDate">{{
            timeAgoStr
          }}</span>
          <template v-if="domain">
            <span class="meta-sep">·</span>
            <span class="story-domain">{{ domain }}</span>
          </template>
        </div>

        <div class="story-actions">
          <a
            v-if="story.url"
            :href="story.url"
            class="action-btn primary-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink :size="16" />
            Read article
          </a>

          <a
            :href="hnUrl"
            class="action-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on HN
          </a>

          <button
            class="action-btn"
            :class="{ bookmarked: isStoryBookmarked }"
            @click="handleBookmark"
          >
            <BookmarkCheck v-if="isStoryBookmarked" :size="16" />
            <Bookmark v-else :size="16" />
            {{ isStoryBookmarked ? "Saved" : "Save" }}
          </button>

          <button class="action-btn" @click="handleShare">
            <Share2 :size="16" />
            Share
          </button>
        </div>
      </header>

      <!-- Story text (for Ask HN, Show HN, etc.) -->
      <div v-if="storyText" class="story-text" v-html="storyText"></div>

      <!-- Comments -->
      <CommentThread
        v-if="story.kids && story.kids.length > 0"
        :comment-ids="story.kids"
        :story-author="story.by"
      />

      <div v-else class="no-comments">
        <p>No comments yet.</p>
        <a :href="hnUrl" target="_blank" rel="noopener noreferrer">
          Be the first to comment on HN →
        </a>
      </div>
    </article>
  </div>
</template>

<style scoped>
.story-detail {
  max-width: 100%;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-6);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--accent);
}

.story-loading {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.meta-skeleton {
  display: flex;
  gap: var(--spacing-3);
}

.story-error {
  text-align: center;
  padding: var(--spacing-8);
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
}

.story-header {
  margin-bottom: var(--spacing-6);
}

.story-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-3);
  line-height: 1.3;
}

.story-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-1);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-4);
}

.meta-sep {
  color: var(--text-tertiary);
}

.story-author {
  color: var(--text-secondary);
  text-decoration: none;
}

.story-author:hover {
  color: var(--accent);
}

.story-domain {
  color: var(--text-tertiary);
}

.story-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  color: var(--text-primary);
  border-color: var(--text-tertiary);
}

.action-btn.primary-btn {
  color: white;
  background-color: var(--accent);
  border-color: var(--accent);
}

.action-btn.primary-btn:hover {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
}

.action-btn.bookmarked {
  color: var(--accent);
  border-color: var(--accent);
}

.story-text {
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  line-height: 1.7;
}

.story-text :deep(p) {
  margin: 0 0 var(--spacing-3);
}

.story-text :deep(p:last-child) {
  margin-bottom: 0;
}

.story-text :deep(a) {
  color: var(--accent);
}

.no-comments {
  margin-top: var(--spacing-8);
  padding: var(--spacing-8);
  text-align: center;
  color: var(--text-secondary);
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.no-comments p {
  margin: 0 0 var(--spacing-3);
}

.no-comments a {
  color: var(--accent);
  text-decoration: none;
}

.no-comments a:hover {
  text-decoration: underline;
}
</style>
