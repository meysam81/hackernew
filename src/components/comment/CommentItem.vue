<script setup lang="ts">
import { ref, computed } from "vue";
import { ChevronDown, ChevronRight, MessageSquare, Loader2 } from "lucide-vue-next";
import type { LazyComment } from "@/lib/hn-client";
import { getMoreReplies, REPLY_BATCH_SIZE } from "@/lib/hn-client";
import { timeAgo, formatDate, sanitizeHtml } from "@/lib/utils";

interface Props {
  comment: LazyComment;
  depth?: number;
  maxDepth?: number;
  highlightAuthor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
  maxDepth: 10,
});

const collapsed = ref(false);
const localReplies = ref<LazyComment[]>([...props.comment.replies]);
const loadingReplies = ref(false);
const repliesLoaded = computed(() => props.comment.repliesLoaded);
const basePath = import.meta.env.BASE_URL || "/";

const timeAgoStr = computed(() => timeAgo(props.comment.time));
const formattedDate = computed(() => formatDate(props.comment.time));
const sanitizedText = computed(() => sanitizeHtml(props.comment.text || ""));
const isHighlighted = computed(
  () => props.comment.by === props.highlightAuthor,
);
const indentClass = computed(() => `depth-${Math.min(props.depth, 8)}`);

// Total reply count including nested
const totalReplyCount = computed(() => {
  return props.comment.replyIds.length;
});

// How many replies are currently loaded
const loadedReplyCount = computed(() => localReplies.value.length);

// How many more replies can be loaded
const remainingReplies = computed(() => {
  return Math.max(0, totalReplyCount.value - loadedReplyCount.value);
});

// Recursively count all nested replies (for collapse indicator)
function countAllReplies(replies: LazyComment[]): number {
  let count = replies.length;
  for (const reply of replies) {
    count += countAllReplies(reply.replies);
  }
  return count;
}

// Memoized nested loaded reply count
const nestedLoadedReplyCount = computed(() => countAllReplies(localReplies.value));

const displayReplyCount = computed(() => {
  // When collapsed, show total potential replies
  if (collapsed.value) {
    return totalReplyCount.value;
  }
  // Otherwise show loaded nested count
  return nestedLoadedReplyCount.value;
});

const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
};

// Load more replies for this comment
const loadMoreReplies = async () => {
  if (loadingReplies.value) return;

  try {
    loadingReplies.value = true;

    const result = await getMoreReplies(
      props.comment.replyIds,
      loadedReplyCount.value,
      REPLY_BATCH_SIZE
    );

    localReplies.value = [...localReplies.value, ...result.replies];

    if (!result.hasMore) {
      repliesLoaded.value = true;
    }
  } catch (err) {
    console.error("Failed to load replies:", err);
  } finally {
    loadingReplies.value = false;
  }
};

// Handle child comment loading more of its replies
const onChildRepliesUpdate = (childId: number, newReplies: LazyComment[]) => {
  const index = localReplies.value.findIndex((r) => r.id === childId);
  if (index !== -1) {
    localReplies.value[index] = {
      ...localReplies.value[index],
      replies: newReplies,
    };
  }
};
</script>

<template>
  <div
    class="comment-item"
    :class="[indentClass, { highlighted: isHighlighted }]"
  >
    <div class="comment-collapse-line" @click="toggleCollapse">
      <div class="collapse-indicator">
        <ChevronDown v-if="!collapsed" :size="12" />
        <ChevronRight v-else :size="12" />
      </div>
    </div>

    <div class="comment-content">
      <div class="comment-header">
        <a :href="`${basePath}user/${comment.by}`" class="comment-author">
          {{ comment.by }}
        </a>
        <span class="comment-time" :title="formattedDate">
          {{ timeAgoStr }}
        </span>
        <button
          v-if="totalReplyCount > 0"
          class="collapse-btn"
          @click="toggleCollapse"
        >
          {{ collapsed ? `[+${displayReplyCount}]` : "[-]" }}
        </button>
      </div>

      <div v-if="!collapsed" class="comment-body" v-html="sanitizedText"></div>

      <div v-if="collapsed" class="comment-collapsed-summary">
        <MessageSquare :size="12" />
        {{ displayReplyCount }} {{ displayReplyCount === 1 ? "reply" : "replies" }} hidden
      </div>

      <!-- Nested replies -->
      <div
        v-if="!collapsed && localReplies.length > 0 && depth < maxDepth"
        class="comment-replies"
      >
        <CommentItem
          v-for="reply in localReplies"
          :key="reply.id"
          :comment="reply"
          :depth="depth + 1"
          :max-depth="maxDepth"
          :highlight-author="highlightAuthor"
          @replies-update="onChildRepliesUpdate"
        />
      </div>

      <!-- Load more replies button -->
      <div
        v-if="!collapsed && remainingReplies > 0 && depth < maxDepth"
        class="load-more-replies"
      >
        <button
          v-if="!loadingReplies"
          class="load-replies-btn"
          @click="loadMoreReplies"
        >
          Load {{ Math.min(remainingReplies, REPLY_BATCH_SIZE) }} more
          {{ remainingReplies === 1 ? "reply" : "replies" }}
          <span v-if="remainingReplies > REPLY_BATCH_SIZE" class="remaining-hint">
            ({{ remainingReplies }} total)
          </span>
        </button>
        <div v-else class="loading-replies" aria-live="polite">
          <Loader2 :size="14" class="spin" />
          <span>Loading replies...</span>
        </div>
      </div>

      <!-- Too deep indicator -->
      <div
        v-if="!collapsed && totalReplyCount > 0 && depth >= maxDepth"
        class="comment-too-deep"
      >
        <a :href="`${basePath}item/${comment.id}`"> Continue thread → </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-item {
  display: flex;
  gap: var(--spacing-2);
  padding: var(--spacing-2) 0;
}

.comment-item.highlighted {
  background-color: var(--accent-muted);
  margin: 0 calc(-1 * var(--spacing-2));
  padding: var(--spacing-2);
  border-radius: var(--radius-sm);
}

/* Indentation levels */
.depth-0 {
  margin-left: 0;
}
.depth-1 {
  margin-left: var(--spacing-4);
}
.depth-2 {
  margin-left: calc(var(--spacing-4) * 2);
}
.depth-3 {
  margin-left: calc(var(--spacing-4) * 3);
}
.depth-4 {
  margin-left: calc(var(--spacing-4) * 4);
}
.depth-5 {
  margin-left: calc(var(--spacing-4) * 5);
}
.depth-6 {
  margin-left: calc(var(--spacing-4) * 6);
}
.depth-7 {
  margin-left: calc(var(--spacing-4) * 7);
}
.depth-8 {
  margin-left: calc(var(--spacing-4) * 8);
}

.comment-collapse-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 16px;
  cursor: pointer;
  flex-shrink: 0;
}

.collapse-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
}

.comment-collapse-line:hover .collapse-indicator {
  color: var(--accent);
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-1);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.comment-author {
  color: var(--text-primary);
  font-weight: 500;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.comment-author:hover {
  color: var(--accent);
}

.comment-time {
  color: var(--text-tertiary);
}

.collapse-btn {
  padding: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.collapse-btn:hover {
  color: var(--accent);
}

.comment-body {
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--text-primary);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.comment-body :deep(p) {
  margin: 0 0 var(--spacing-3);
}

.comment-body :deep(p:last-child) {
  margin-bottom: 0;
}

.comment-body :deep(a) {
  color: var(--accent);
  text-decoration: none;
}

.comment-body :deep(a:hover) {
  text-decoration: underline;
}

.comment-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
  padding: 2px 4px;
  background-color: var(--bg-tertiary);
  border-radius: 4px;
}

.comment-body :deep(pre) {
  padding: var(--spacing-3);
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.comment-body :deep(pre code) {
  padding: 0;
  background: none;
}

.comment-collapsed-summary {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  font-style: italic;
}

.comment-replies {
  margin-top: var(--spacing-2);
  border-left: 1px solid var(--border-subtle);
  padding-left: var(--spacing-2);
}

.load-more-replies {
  margin-top: var(--spacing-2);
  padding-left: var(--spacing-2);
}

.load-replies-btn {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--accent);
  background: none;
  border: 1px dashed var(--accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.load-replies-btn:hover {
  background-color: var(--accent-muted);
  border-style: solid;
}

.remaining-hint {
  color: var(--text-tertiary);
  font-weight: 400;
}

.loading-replies {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}



/* Respect user preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .spin {
    animation: none !important;
  }
}
.comment-too-deep {
  margin-top: var(--spacing-2);
  font-size: var(--text-sm);
}

.comment-too-deep a {
  color: var(--accent);
  text-decoration: none;
}

.comment-too-deep a:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .depth-1 {
    margin-left: var(--spacing-3);
  }
  .depth-2 {
    margin-left: calc(var(--spacing-3) * 2);
  }
  .depth-3 {
    margin-left: calc(var(--spacing-3) * 3);
  }
  .depth-4 {
    margin-left: calc(var(--spacing-3) * 4);
  }
  .depth-5,
  .depth-6,
  .depth-7,
  .depth-8 {
    margin-left: calc(var(--spacing-3) * 5);
  }
}
</style>
