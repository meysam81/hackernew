<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { HNComment } from '@/lib/hn-client';
import { getCommentTree } from '@/lib/hn-client';
import CommentItem from './CommentItem.vue';
import CommentSkeleton from './CommentSkeleton.vue';

interface CommentWithReplies extends HNComment {
  replies: CommentWithReplies[];
}

interface Props {
  commentIds: number[];
  storyAuthor?: string;
}

const props = defineProps<Props>();

const comments = ref<CommentWithReplies[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const totalComments = computed(() => {
  function countAll(items: CommentWithReplies[]): number {
    let count = items.length;
    for (const item of items) {
      count += countAll(item.replies);
    }
    return count;
  }
  return countAll(comments.value);
});

const fetchComments = async () => {
  if (!props.commentIds || props.commentIds.length === 0) {
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    comments.value = await getCommentTree(props.commentIds) as CommentWithReplies[];
  } catch (err) {
    console.error('Error fetching comments:', err);
    error.value = 'Failed to load comments.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchComments();
});
</script>

<template>
  <div class="comment-thread">
    <div class="thread-header">
      <h2 class="thread-title">
        Comments
        <span v-if="!loading" class="comment-count">({{ totalComments }})</span>
      </h2>
    </div>

    <!-- Loading -->
    <CommentSkeleton v-if="loading" :count="5" />

    <!-- Error -->
    <div v-else-if="error" class="thread-error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchComments">Try again</button>
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
</style>
