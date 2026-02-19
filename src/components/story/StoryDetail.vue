<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  ExternalLink,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  MessageCircle,
  ArrowUpCircle,
  Clock,
  User,
  Link as LinkIcon,
  Copy,
  Check,
  Briefcase,
  HelpCircle,
  Presentation,
} from "lucide-vue-next";
import type { HNStory } from "@/lib/hn-client";
import { getItem, getDomain, getHNUrl } from "@/lib/hn-client";
import { timeAgo, formatDate, sanitizeHtml } from "@/lib/utils";
import { useBookmarks } from "@/composables/useBookmarks";
import { useReadHistory } from "@/composables/useReadHistory";
import { useKeyboard } from "@/composables/useKeyboard";
import { useToast } from "@/composables/useToast";
import CommentThread from "../comment/CommentThread.vue";
import Skeleton from "../ui/Skeleton.vue";
import Toast from "../ui/Toast.vue";

interface Props {
  storyId: string;
}

const props = defineProps<Props>();

// State
const story = ref<HNStory | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const copiedLink = ref(false);

// Composables
const { isBookmarked, toggleBookmark } = useBookmarks();
const { markAsRead } = useReadHistory();
const { success, info } = useToast();

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

// Computed properties
const domain = computed(() => (story.value ? getDomain(story.value.url) : ""));
const timeAgoStr = computed(() =>
  story.value ? timeAgo(story.value.time) : ""
);
const formattedDate = computed(() =>
  story.value ? formatDate(story.value.time) : ""
);
const hnUrl = computed(() => (story.value ? getHNUrl(story.value.id) : ""));
const isStoryBookmarked = computed(() =>
  story.value ? isBookmarked(story.value.id) : false
);
const storyText = computed(() =>
  story.value?.text ? sanitizeHtml(story.value.text) : ""
);
const hasComments = computed(
  () => story.value?.kids && story.value.kids.length > 0
);
const commentCount = computed(() => story.value?.descendants ?? 0);

// Item type detection
const itemType = computed(() => {
  if (!story.value) return "story";
  if (story.value.type === "job") return "job";
  const title = story.value.title?.toLowerCase() || "";
  if (title.startsWith("ask hn:") || title.startsWith("ask hn")) return "ask";
  if (title.startsWith("show hn:") || title.startsWith("show hn")) return "show";
  if (story.value.type === "poll") return "poll";
  return "story";
});

const itemTypeLabel = computed(() => {
  switch (itemType.value) {
    case "job":
      return "Job Posting";
    case "ask":
      return "Ask HN";
    case "show":
      return "Show HN";
    case "poll":
      return "Poll";
    default:
      return null;
  }
});

const itemTypeIcon = computed(() => {
  switch (itemType.value) {
    case "job":
      return Briefcase;
    case "ask":
      return HelpCircle;
    case "show":
      return Presentation;
    default:
      return null;
  }
});

// Score indicator (for visual feedback)
const scoreLevel = computed(() => {
  if (!story.value) return "low";
  const score = story.value.score;
  if (score >= 500) return "viral";
  if (score >= 200) return "hot";
  if (score >= 100) return "popular";
  if (score >= 50) return "rising";
  return "new";
});

// Keyboard navigation
useKeyboard({
  onBack: () => {
    window.history.back();
  },
  onOpen: () => {
    if (story.value?.url) {
      window.open(story.value.url, "_blank", "noopener,noreferrer");
    }
  },
  onBookmark: () => {
    handleBookmark();
  },
});

// Methods
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

    const data = await getItem<HNStory>(parseInt(id, 10));
    if (!data) {
      throw new Error("Item not found");
    }

    // Handle deleted/dead items
    if (data.deleted) {
      error.value = "This item has been deleted.";
      loading.value = false;
      return;
    }

    if (data.dead) {
      error.value = "This item has been flagged and is no longer visible.";
      loading.value = false;
      return;
    }

    story.value = data;
    markAsRead(data.id);

    // Update document title
    if (typeof document !== "undefined") {
      document.title = `${data.title} | HackerNew`;
    }
  } catch (err) {
    error.value = "Failed to load this item. Please try again.";
  } finally {
    loading.value = false;
  }
};

const handleBookmark = async () => {
  if (story.value) {
    await toggleBookmark(story.value);
    if (isStoryBookmarked.value) {
      success("Added to bookmarks");
    } else {
      info("Removed from bookmarks");
    }
  }
};

const handleShare = async () => {
  if (!story.value) return;

  const shareUrl = window.location.href;
  const shareData = {
    title: story.value.title,
    url: shareUrl,
  };

  // Try native share first
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      // User cancelled or error, fall through to clipboard
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(shareUrl);
    copiedLink.value = true;
    success("Link copied to clipboard");
    setTimeout(() => {
      copiedLink.value = false;
    }, 2000);
  } catch (err) {
    // Clipboard API failed, show URL in prompt
    info("Copy this link: " + shareUrl);
  }
};

const copyLink = async () => {
  if (!story.value) return;
  const url = story.value.url || window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    copiedLink.value = true;
    success("Link copied to clipboard");
    setTimeout(() => {
      copiedLink.value = false;
    }, 2000);
  } catch {
    info("Copy this link: " + url);
  }
};

// Lifecycle
onMounted(() => {
  fetchStory();
});

// Watch for storyId changes
watch(
  () => props.storyId,
  () => {
    fetchStory();
  }
);
</script>

<template>
  <div class="story-detail">
    <!-- Toast container -->
    <Toast />

    <!-- Back navigation -->
    <a :href="basePath" class="back-link">
      <ArrowLeft :size="16" />
      <span>Back to stories</span>
    </a>

    <!-- Loading State -->
    <div v-if="loading" class="story-loading">
      <div class="loading-header">
        <Skeleton width="85%" height="32px" />
        <div class="loading-meta">
          <Skeleton width="80px" height="18px" />
          <Skeleton width="100px" height="18px" />
          <Skeleton width="60px" height="18px" />
        </div>
        <div class="loading-actions">
          <Skeleton width="120px" height="36px" />
          <Skeleton width="100px" height="36px" />
          <Skeleton width="80px" height="36px" />
        </div>
      </div>
      <Skeleton width="100%" height="1px" />
      <div class="loading-comments">
        <Skeleton width="140px" height="24px" />
        <div v-for="i in 3" :key="i" class="loading-comment">
          <Skeleton width="100px" height="16px" />
          <Skeleton width="100%" height="48px" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="story-error">
      <div class="error-icon">
        <HelpCircle :size="48" />
      </div>
      <h2>Unable to load</h2>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchStory">
        Try again
      </button>
      <a :href="basePath" class="back-to-home">
        Return to homepage
      </a>
    </div>

    <!-- Story Content -->
    <article v-else-if="story" class="story-content">
      <!-- Item Type Badge -->
      <div v-if="itemTypeLabel" class="item-type-badge" :class="itemType">
        <component :is="itemTypeIcon" v-if="itemTypeIcon" :size="14" />
        {{ itemTypeLabel }}
      </div>

      <!-- Header -->
      <header class="story-header">
        <h1 class="story-title">
          <a
            v-if="story.url"
            :href="story.url"
            target="_blank"
            rel="noopener noreferrer"
            class="title-link"
          >
            {{ story.title }}
            <ExternalLink :size="18" class="title-icon" />
          </a>
          <span v-else>{{ story.title }}</span>
        </h1>

        <!-- Domain badge -->
        <a
          v-if="domain"
          :href="story.url"
          class="domain-badge"
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkIcon :size="12" />
          {{ domain }}
        </a>

        <!-- Metadata -->
        <div class="story-meta">
          <div class="meta-item score" :class="scoreLevel">
            <ArrowUpCircle :size="16" />
            <span class="score-value">{{ story.score }}</span>
            <span class="score-label">{{ story.score === 1 ? 'point' : 'points' }}</span>
          </div>

          <div class="meta-divider"></div>

          <a :href="`${basePath}user/${story.by}`" class="meta-item author">
            <User :size="16" />
            <span>{{ story.by }}</span>
          </a>

          <div class="meta-divider"></div>

          <div class="meta-item time" :title="formattedDate">
            <Clock :size="16" />
            <span>{{ timeAgoStr }}</span>
          </div>

          <div v-if="itemType !== 'job'" class="meta-divider"></div>

          <div v-if="itemType !== 'job'" class="meta-item comments">
            <MessageCircle :size="16" />
            <span>{{ commentCount }} {{ commentCount === 1 ? 'comment' : 'comments' }}</span>
          </div>
        </div>
      </header>

      <!-- Action Buttons -->
      <div class="story-actions">
        <a
          v-if="story.url"
          :href="story.url"
          class="action-btn primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink :size="16" />
          <span>Read Article</span>
        </a>

        <a
          :href="hnUrl"
          class="action-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="hn-logo">Y</span>
          <span>View on HN</span>
        </a>

        <button
          class="action-btn"
          :class="{ active: isStoryBookmarked }"
          @click="handleBookmark"
        >
          <BookmarkCheck v-if="isStoryBookmarked" :size="16" />
          <Bookmark v-else :size="16" />
          <span>{{ isStoryBookmarked ? 'Saved' : 'Save' }}</span>
        </button>

        <button class="action-btn" @click="handleShare">
          <Check v-if="copiedLink" :size="16" />
          <Share2 v-else :size="16" />
          <span>{{ copiedLink ? 'Copied!' : 'Share' }}</span>
        </button>

        <button v-if="story.url" class="action-btn icon-only" @click="copyLink" title="Copy link">
          <Copy :size="16" />
        </button>
      </div>

      <!-- Story Text (Ask HN, Show HN, etc.) -->
      <div v-if="storyText" class="story-text" v-html="storyText"></div>

      <!-- Comments Section -->
      <section v-if="itemType !== 'job'" class="comments-section">
        <CommentThread
          v-if="hasComments"
          :comment-ids="story.kids!"
          :story-author="story.by"
        />

        <div v-else class="no-comments">
          <MessageCircle :size="32" class="empty-icon" />
          <p>No comments yet</p>
          <a
            :href="hnUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="hn-link"
          >
            Be the first to comment on HN
            <ExternalLink :size="14" />
          </a>
        </div>
      </section>

      <!-- Job posting footer -->
      <div v-if="itemType === 'job'" class="job-footer">
        <p>This is a job posting from Hacker News.</p>
        <a
          :href="story.url || hnUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="apply-btn"
        >
          {{ story.url ? 'View Job Details' : 'View on Hacker News' }}
          <ExternalLink :size="16" />
        </a>
      </div>
    </article>

    <!-- Keyboard shortcuts hint -->
    <div class="keyboard-hint">
      <kbd>Esc</kbd> back
      <span class="hint-divider">|</span>
      <kbd>o</kbd> open
      <span class="hint-divider">|</span>
      <kbd>b</kbd> bookmark
    </div>
  </div>
</template>

<style scoped>
.story-detail {
  max-width: 100%;
  position: relative;
}

/* Back Link */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-6);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.back-link:hover {
  color: var(--text-primary);
  background-color: var(--border-default);
}

/* Loading State */
.story-loading {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.loading-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.loading-meta {
  display: flex;
  gap: var(--spacing-4);
}

.loading-actions {
  display: flex;
  gap: var(--spacing-2);
}

.loading-comments {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.loading-comment {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

/* Error State */
.story-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-12) var(--spacing-4);
  min-height: 300px;
}

.error-icon {
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-4);
}

.story-error h2 {
  margin: 0 0 var(--spacing-2);
  font-size: var(--text-xl);
  color: var(--text-primary);
}

.story-error p {
  margin: 0 0 var(--spacing-6);
  color: var(--text-secondary);
  max-width: 400px;
}

.retry-btn {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--text-sm);
  font-weight: 600;
  color: white;
  background-color: var(--accent);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.retry-btn:hover {
  background-color: var(--accent-hover);
}

.back-to-home {
  margin-top: var(--spacing-4);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-decoration: none;
}

.back-to-home:hover {
  color: var(--accent);
}

/* Item Type Badge */
.item-type-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-3);
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: var(--radius-sm);
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

.item-type-badge.job {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.dark .item-type-badge.job {
  background-color: #1e3a5f;
  color: #93c5fd;
}

.item-type-badge.ask {
  background-color: #fef3c7;
  color: #b45309;
}

.dark .item-type-badge.ask {
  background-color: #451a03;
  color: #fcd34d;
}

.item-type-badge.show {
  background-color: #dcfce7;
  color: #15803d;
}

.dark .item-type-badge.show {
  background-color: #14532d;
  color: #86efac;
}

/* Story Header */
.story-header {
  margin-bottom: var(--spacing-4);
}

.story-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-3);
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.title-link {
  color: inherit;
  text-decoration: none;
  display: inline;
}

.title-link:hover {
  color: var(--accent);
}

.title-icon {
  display: inline;
  vertical-align: middle;
  margin-left: var(--spacing-2);
  opacity: 0.5;
  transition: opacity var(--transition-fast);
}

.title-link:hover .title-icon {
  opacity: 1;
}

/* Domain Badge */
.domain-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-3);
  padding: var(--spacing-1) var(--spacing-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.domain-badge:hover {
  color: var(--accent);
  background-color: var(--accent-muted);
}

/* Metadata */
.story-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--text-sm);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--text-secondary);
}

.meta-item.author {
  text-decoration: none;
  transition: color var(--transition-fast);
}

.meta-item.author:hover {
  color: var(--accent);
}

.meta-divider {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--text-tertiary);
}

/* Score styling */
.meta-item.score {
  font-weight: 600;
  font-family: var(--font-mono);
}

.score-value {
  font-weight: 700;
}

.score-label {
  font-weight: 400;
  color: var(--text-tertiary);
}

.meta-item.score.viral {
  color: #ef4444;
}

.meta-item.score.hot {
  color: var(--accent);
}

.meta-item.score.popular {
  color: #f59e0b;
}

.meta-item.score.rising {
  color: #22c55e;
}

.meta-item.score.new {
  color: var(--text-secondary);
}

/* Action Buttons */
.story-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-6);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--border-subtle);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.action-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  border-color: var(--text-tertiary);
}

.action-btn.primary {
  color: white;
  background-color: var(--accent);
  border-color: var(--accent);
}

.action-btn.primary:hover {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
}

.action-btn.active {
  color: var(--accent);
  border-color: var(--accent);
  background-color: var(--accent-muted);
}

.action-btn.icon-only {
  padding: var(--spacing-2);
}

.hn-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 700;
  color: white;
  background-color: #ff6600;
  border-radius: 2px;
}

/* Story Text */
.story-text {
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent);
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
  text-decoration: none;
}

.story-text :deep(a:hover) {
  text-decoration: underline;
}

.story-text :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
  padding: 2px 6px;
  background-color: var(--bg-secondary);
  border-radius: 4px;
}

.story-text :deep(pre) {
  padding: var(--spacing-3);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-sm);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.story-text :deep(pre code) {
  padding: 0;
  background: none;
}

/* Comments Section */
.comments-section {
  border-top: 1px solid var(--border-default);
  padding-top: var(--spacing-6);
}

.no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-12) var(--spacing-4);
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.empty-icon {
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-3);
}

.no-comments p {
  margin: 0 0 var(--spacing-3);
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.hn-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--accent);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 500;
}

.hn-link:hover {
  text-decoration: underline;
}

/* Job Footer */
.job-footer {
  margin-top: var(--spacing-6);
  padding: var(--spacing-6);
  text-align: center;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.job-footer p {
  margin: 0 0 var(--spacing-4);
  color: var(--text-secondary);
}

.apply-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--text-base);
  font-weight: 600;
  color: white;
  background-color: var(--accent);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: background-color var(--transition-fast);
}

.apply-btn:hover {
  background-color: var(--accent-hover);
}

/* Keyboard Hints */
.keyboard-hint {
  position: fixed;
  bottom: var(--spacing-4);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  opacity: 0.8;
  transition: opacity var(--transition-fast);
  z-index: 10;
}

.keyboard-hint:hover {
  opacity: 1;
}

.keyboard-hint kbd {
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: 4px;
}

.hint-divider {
  color: var(--border-default);
}

/* Mobile Responsiveness */
@media (max-width: 640px) {
  .story-title {
    font-size: var(--text-xl);
  }

  .story-meta {
    gap: var(--spacing-1);
  }

  .meta-item {
    font-size: var(--text-xs);
  }

  .meta-divider {
    width: 3px;
    height: 3px;
  }

  .story-actions {
    gap: var(--spacing-1);
  }

  .action-btn {
    padding: var(--spacing-2);
    font-size: var(--text-xs);
  }

  .action-btn span:not(.hn-logo) {
    display: none;
  }

  .action-btn.primary span {
    display: inline;
  }

  .keyboard-hint {
    display: none;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .action-btn.icon-only {
    display: none;
  }
}
</style>
