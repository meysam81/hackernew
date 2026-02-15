<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from "vue";
import type { LazyComment } from "@/lib/hn-client";
import { getCommentBatch, COMMENT_BATCH_SIZE } from "@/lib/hn-client";
import CommentItem from "./CommentItem.vue";
import CommentSkeleton from "./CommentSkeleton.vue";
import { Loader2 } from "lucide-vue-next";

interface Props {
  commentIds: number[];
  storyAuthor?: string;
}

const props = defineProps<Props>();

const comments = ref<LazyComment[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const error = ref<string | null>(null);
const hasMore = ref(false);
const totalComments = ref(0);
const loadedOffset = ref(0);

// Intersection observer for infinite scroll
const loadMoreTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const loadedCount = computed(() => comments.value.length);

const fetchInitialComments = async () => {
  if (!props.commentIds || props.commentIds.length === 0) {
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    const result = await getCommentBatch(
      props.commentIds,
      0,
      COMMENT_BATCH_SIZE,
    );
    comments.value = result.comments;
    hasMore.value = result.hasMore;
    totalComments.value = result.total;
    loadedOffset.value = result.comments.length;
  } catch (err) {
    error.value = "Failed to load comments.";
  } finally {
    loading.value = false;
  }
};

const loadMoreComments = async () => {
  if (loadingMore.value || !hasMore.value) {
    return;
  }

  try {
    loadingMore.value = true;

    const result = await getCommentBatch(
      props.commentIds,
      loadedOffset.value,
      COMMENT_BATCH_SIZE,
    );

    comments.value = [...comments.value, ...result.comments];
    hasMore.value = result.hasMore;
    loadedOffset.value += result.comments.length;
  } catch (err) {
    // Silently fail on load more - user can retry
  } finally {
    loadingMore.value = false;
  }
};

// Setup intersection observer for auto-loading more comments
const setupIntersectionObserver = () => {
  if (!loadMoreTrigger.value) {
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore.value && !loadingMore.value) {
        loadMoreComments();
      }
    },
    {
      rootMargin: "200px", // Load more when within 200px of the trigger
      threshold: 0,
    },
  );

  observer.observe(loadMoreTrigger.value);
};

onMounted(() => {
  fetchInitialComments();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

// Watch for the trigger element to be available
const onTriggerRef = (el: HTMLElement | null) => {
  // Disconnect previous observer if it exists
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  loadMoreTrigger.value = el;
  if (el) {
    setupIntersectionObserver();
  }
};
</script>

<template>
  <div class="comment-thread">
    <div class="thread-header">
      <h2 class="thread-title">
        Comments
        <span v-if="!loading && totalComments > 0" class="comment-count">
          ({{ loadedCount }} of {{ totalComments }})
        </span>
        <span v-else-if="!loading" class="comment-count">(0)</span>
      </h2>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      role="status"
      aria-label="Loading comments"
      aria-busy="true"
    >
      <CommentSkeleton :count="5" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="thread-error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchInitialComments">Try again</button>
    </div>

    <!-- Empty -->
    <div v-else-if="comments.length === 0" class="thread-empty">
      <p>No comments yet. Be the first to comment on HN!</p>
    </div>

    <!-- Comments -->
    <div v-else class="comments-list">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :highlight-author="storyAuthor"
      />

      <!-- Load more trigger (for intersection observer) -->
      <div v-if="hasMore" :ref="onTriggerRef" class="load-more-trigger">
        <button
          v-if="!loadingMore"
          class="load-more-btn"
          @click="loadMoreComments"
        >
          Load more comments ({{ totalComments - loadedCount }} remaining)
        </button>
        <div v-else class="loading-more" aria-live="polite">
          <Loader2 :size="16" class="spin" />
          <span>Loading more comments...</span>
        </div>
      </div>

      <!-- All loaded indicator -->
      <div v-if="!hasMore && comments.length > 0" class="all-loaded">
        All {{ totalComments }} comments loaded
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-thread {
  margin-top: var(--spacing-6);
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--border-default);
}

.thread-header {
  margin-bottom: var(--spacing-4);
}

.thread-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.comment-count {
  font-weight: 400;
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.thread-error,
.thread-empty {
  padding: var(--spacing-8);
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

.comments-list {
  display: flex;
  flex-direction: column;
}

.load-more-trigger {
  padding: var(--spacing-4);
  display: flex;
  justify-content: center;
}

.load-more-btn {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--accent);
  background: none;
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.load-more-btn:hover {
  background-color: var(--accent-muted);
}

.loading-more {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spin {
    animation: none !important;
  }
}

.all-loaded {
  padding: var(--spacing-4);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}
</style>
