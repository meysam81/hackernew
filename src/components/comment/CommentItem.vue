<script setup lang="ts">
import { ref, computed, inject, type Ref, type ComputedRef } from "vue";
import { ChevronDown, ChevronRight, MessageSquare } from "lucide-vue-next";
import type { HNComment } from "@/lib/hn-client";
import { timeAgo, formatDate, sanitizeHtml } from "@/lib/utils";

interface CommentWithReplies extends HNComment {
  replies: CommentWithReplies[];
}

interface Props {
  comment: CommentWithReplies;
  depth?: number;
  maxDepth?: number;
  highlightAuthor?: string;
  flatIndex?: number;
  selectedIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
  maxDepth: 10,
  flatIndex: -1,
  selectedIndex: -1,
});

// Inject from parent CommentThread
const selectedCommentId = inject<ComputedRef<number | null>>("selectedCommentId", computed(() => null));
const collapsedIds = inject<Ref<Set<number>>>("collapsedIds", ref(new Set()));
const toggleCollapseFromParent = inject<(id?: number) => void>("toggleCollapse", () => {});

const basePath = import.meta.env.BASE_URL || "/";

const timeAgoStr = computed(() => timeAgo(props.comment.time));
const formattedDate = computed(() => formatDate(props.comment.time));
const sanitizedText = computed(() => sanitizeHtml(props.comment.text || ""));
const replyCount = computed(() => countReplies(props.comment));
const isHighlighted = computed(
  () => props.comment.by === props.highlightAuthor,
);
const indentClass = computed(() => `depth-${Math.min(props.depth, 8)}`);

// Check if this comment is selected via keyboard navigation
const isSelected = computed(() => selectedCommentId.value === props.comment.id);

// Check if collapsed via parent state
const collapsed = computed(() => collapsedIds.value.has(props.comment.id));

// Calculate flat indices for nested comments
const getNestedFlatIndex = (replyIndex: number): number => {
  if (props.flatIndex === -1) return -1;

  let index = props.flatIndex + 1; // Start after current comment
  for (let i = 0; i < replyIndex; i++) {
    index += 1 + countAllReplies(props.comment.replies[i]);
  }
  return index;
};

function countReplies(comment: CommentWithReplies): number {
  let count = comment.replies.length;
  for (const reply of comment.replies) {
    count += countReplies(reply);
  }
  return count;
}

function countAllReplies(comment: CommentWithReplies): number {
  if (collapsedIds.value.has(comment.id)) return 0;
  let count = comment.replies.length;
  for (const reply of comment.replies) {
    count += countAllReplies(reply);
  }
  return count;
}

const toggleCollapse = () => {
  toggleCollapseFromParent(props.comment.id);
};
</script>

<template>
  <div
    class="comment-item"
    :class="[indentClass, { highlighted: isHighlighted, selected: isSelected }]"
    :data-comment-index="flatIndex"
    :data-comment-id="comment.id"
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
          v-if="comment.replies.length > 0"
          class="collapse-btn"
          @click="toggleCollapse"
        >
          {{ collapsed ? `[+${replyCount}]` : "[-]" }}
        </button>
      </div>

      <div v-if="!collapsed" class="comment-body" v-html="sanitizedText"></div>

      <div v-if="collapsed" class="comment-collapsed-summary">
        <MessageSquare :size="12" />
        {{ replyCount }} {{ replyCount === 1 ? "reply" : "replies" }} hidden
      </div>

      <!-- Nested replies -->
      <div
        v-if="!collapsed && comment.replies.length > 0 && depth < maxDepth"
        class="comment-replies"
      >
        <CommentItem
          v-for="(reply, replyIdx) in comment.replies"
          :key="reply.id"
          :comment="reply"
          :depth="depth + 1"
          :max-depth="maxDepth"
          :highlight-author="highlightAuthor"
          :flat-index="getNestedFlatIndex(replyIdx)"
          :selected-index="selectedIndex"
        />
      </div>

      <!-- Too deep indicator -->
      <div
        v-if="!collapsed && comment.replies.length > 0 && depth >= maxDepth"
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

.comment-item.selected {
  background-color: var(--bg-tertiary);
  margin: 0 calc(-1 * var(--spacing-2));
  padding: var(--spacing-2);
  border-radius: var(--radius-sm);
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.comment-item.selected.highlighted {
  background-color: var(--accent-muted);
  outline-color: var(--accent-hover);
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
