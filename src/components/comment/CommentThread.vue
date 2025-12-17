<script setup lang="ts">
import { ref, onMounted, computed, provide, watch, onUnmounted } from "vue";
import type { LazyComment } from "@/lib/hn-client";
import { getCommentBatch, COMMENT_BATCH_SIZE } from "@/lib/hn-client";
import { useVimKeyboard } from "@/composables/useVimKeyboard";
import { useTheme } from "@/composables/useTheme";
import CommentItem from "./CommentItem.vue";
import CommentSkeleton from "./CommentSkeleton.vue";
import { Loader2 } from "lucide-vue-next";

interface FlatComment {
  comment: LazyComment;
  depth: number;
  index: number;
  parentIndex: number | null;
  rootIndex: number;
}

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
const selectedIndex = ref(0);
const collapsedIds = ref<Set<number>>(new Set());
const showHelpModal = ref(false);

const basePath = import.meta.env.BASE_URL || "/";
const { toggleTheme } = useTheme();

// Intersection observer for infinite scroll
const loadMoreTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const loadedCount = computed(() => comments.value.length);

// Build flat list of visible comments for navigation
const flatComments = computed<FlatComment[]>(() => {
  const result: FlatComment[] = [];
  let currentIndex = 0;

  function traverse(
    items: LazyComment[],
    depth: number,
    parentIndex: number | null,
    rootIndex: number
  ) {
    for (const comment of items) {
      const myIndex = currentIndex++;
      const myRootIndex = depth === 0 ? myIndex : rootIndex;

      result.push({
        comment,
        depth,
        index: myIndex,
        parentIndex,
        rootIndex: myRootIndex,
      });

      // Only traverse replies if not collapsed
      if (!collapsedIds.value.has(comment.id) && comment.replies.length > 0) {
        traverse(comment.replies, depth + 1, myIndex, myRootIndex);
      }
    }
  }

  traverse(comments.value, 0, null, 0);
  return result;
});

// Get the currently selected flat comment
const selectedFlatComment = computed(() => {
  return flatComments.value[selectedIndex.value] || null;
});

// Provide selected comment ID to children
provide("selectedCommentId", computed(() => selectedFlatComment.value?.comment.id ?? null));
provide("collapsedIds", collapsedIds);
provide("toggleCollapse", toggleCollapse);

const fetchInitialComments = async () => {
  if (!props.commentIds || props.commentIds.length === 0) {
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    const result = await getCommentBatch(props.commentIds, 0, COMMENT_BATCH_SIZE);
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
  if (loadingMore.value || !hasMore.value) return;

  try {
    loadingMore.value = true;

    const result = await getCommentBatch(
      props.commentIds,
      loadedOffset.value,
      COMMENT_BATCH_SIZE
    );

    comments.value = [...comments.value, ...result.comments];
    hasMore.value = result.hasMore;
    loadedOffset.value += result.comments.length;
  } catch (err) {
    // Silently fail on load more - user can retry
    console.error("Failed to load more comments:", err);
  } finally {
    loadingMore.value = false;
  }
};

// Setup intersection observer for auto-loading more comments
const setupIntersectionObserver = () => {
  if (!loadMoreTrigger.value) return;

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
    }
  );

  observer.observe(loadMoreTrigger.value);
};

// Scroll selected comment into view
const scrollToSelected = () => {
  const element = document.querySelector(`[data-comment-index="${selectedIndex.value}"]`);
  element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

// Navigate comments
const navigateComments = (direction: "up" | "down", count: number = 1) => {
  if (flatComments.value.length === 0) return;

  if (direction === "down") {
    selectedIndex.value = Math.min(
      selectedIndex.value + count,
      flatComments.value.length - 1
    );
  } else {
    selectedIndex.value = Math.max(selectedIndex.value - count, 0);
  }
  scrollToSelected();
};

// Jump to parent comment
const jumpToParent = () => {
  const current = selectedFlatComment.value;
  if (current?.parentIndex !== null && current?.parentIndex !== undefined) {
    selectedIndex.value = current.parentIndex;
    scrollToSelected();
  }
};

// Navigate to next sibling (same depth level)
const nextSibling = () => {
  const current = selectedFlatComment.value;
  if (!current) return;

  for (let i = selectedIndex.value + 1; i < flatComments.value.length; i++) {
    const fc = flatComments.value[i];
    if (fc.depth === current.depth && fc.parentIndex === current.parentIndex) {
      selectedIndex.value = i;
      scrollToSelected();
      return;
    }
    // Stop if we've gone up in the tree
    if (fc.depth < current.depth) break;
  }
};

// Navigate to previous sibling
const prevSibling = () => {
  const current = selectedFlatComment.value;
  if (!current) return;

  for (let i = selectedIndex.value - 1; i >= 0; i--) {
    const fc = flatComments.value[i];
    if (fc.depth === current.depth && fc.parentIndex === current.parentIndex) {
      selectedIndex.value = i;
      scrollToSelected();
      return;
    }
    // Stop if we've passed the parent
    if (fc.depth < current.depth) break;
  }
};

// Navigate to next root comment
const nextRoot = () => {
  const current = selectedFlatComment.value;
  if (!current) return;

  for (let i = selectedIndex.value + 1; i < flatComments.value.length; i++) {
    if (flatComments.value[i].depth === 0) {
      selectedIndex.value = i;
      scrollToSelected();
      return;
    }
  }
};

// Navigate to previous root comment
const prevRoot = () => {
  for (let i = selectedIndex.value - 1; i >= 0; i--) {
    if (flatComments.value[i].depth === 0) {
      selectedIndex.value = i;
      scrollToSelected();
      return;
    }
  }
};

// Enter first reply (l key)
const enterThread = () => {
  const current = selectedFlatComment.value;
  if (!current) return;

  // Check if current comment has replies and is not collapsed
  if (current.comment.replies.length > 0 && !collapsedIds.value.has(current.comment.id)) {
    // Next comment should be the first reply
    if (selectedIndex.value + 1 < flatComments.value.length) {
      const next = flatComments.value[selectedIndex.value + 1];
      if (next.parentIndex === selectedIndex.value) {
        selectedIndex.value++;
        scrollToSelected();
      }
    }
  }
};

// Exit to parent (h key)
const exitThread = () => {
  jumpToParent();
};

// Toggle collapse for selected comment
function toggleCollapse(commentId?: number) {
  const id = commentId ?? selectedFlatComment.value?.comment.id;
  if (id === undefined) return;

  if (collapsedIds.value.has(id)) {
    collapsedIds.value.delete(id);
  } else {
    collapsedIds.value.add(id);
  }
  // Force reactivity
  collapsedIds.value = new Set(collapsedIds.value);
}

// Collapse selected comment
const collapseComment = () => {
  const id = selectedFlatComment.value?.comment.id;
  if (id !== undefined) {
    collapsedIds.value.add(id);
    collapsedIds.value = new Set(collapsedIds.value);
  }
};

// Expand selected comment
const expandComment = () => {
  const id = selectedFlatComment.value?.comment.id;
  if (id !== undefined) {
    collapsedIds.value.delete(id);
    collapsedIds.value = new Set(collapsedIds.value);
  }
};

// Collapse all comments
const collapseAll = () => {
  const allIds = flatComments.value
    .filter((fc) => fc.comment.replies.length > 0)
    .map((fc) => fc.comment.id);
  collapsedIds.value = new Set(allIds);
};

// Expand all comments
const expandAll = () => {
  collapsedIds.value = new Set();
};

// Go to destination
const goToDestination = (destination: string) => {
  window.location.href = `${basePath}${destination.replace(/^\//, "")}`;
};

// Go back
const goBack = () => {
  window.history.back();
};

// Toggle help modal
const toggleHelpModal = () => {
  showHelpModal.value = !showHelpModal.value;
};

// Vim keyboard navigation for comments
const { pendingSequence } = useVimKeyboard({
  context: "comments",
  onCommentNavigate: navigateComments,
  onCommentParent: jumpToParent,
  onCommentNextSibling: nextSibling,
  onCommentPrevSibling: prevSibling,
  onCommentNextRoot: nextRoot,
  onCommentPrevRoot: prevRoot,
  onCommentEnter: enterThread,
  onCommentExit: exitThread,
  onCommentToggleFold: () => toggleCollapse(),
  onCommentFold: collapseComment,
  onCommentUnfold: expandComment,
  onCommentFoldAll: collapseAll,
  onCommentUnfoldAll: expandAll,
  onCenterSelected: () => {
    const element = document.querySelector(`[data-comment-index="${selectedIndex.value}"]`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  },
  onJumpToFirst: () => {
    selectedIndex.value = 0;
    scrollToSelected();
  },
  onJumpToLast: () => {
    selectedIndex.value = Math.max(0, flatComments.value.length - 1);
    scrollToSelected();
  },
  onPageScroll: (direction) => {
    const scrollAmount = window.innerHeight / 2;
    window.scrollBy({
      top: direction === "down" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  },
  onGoTo: goToDestination,
  onBack: goBack,
  onToggleTheme: toggleTheme,
  onShowHelp: toggleHelpModal,
});

// Reset selection when comments change
watch(comments, () => {
  selectedIndex.value = 0;
});

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
      <div class="thread-actions" v-if="!loading && comments.length > 0">
        <button class="thread-action-btn" @click="expandAll" title="Expand all (zR)">
          Expand all
        </button>
        <button class="thread-action-btn" @click="collapseAll" title="Collapse all (zM)">
          Collapse all
        </button>
      </div>
    </div>

    <!-- Loading -->
    <CommentSkeleton v-if="loading" :count="5" />

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
        :flat-index="flatComments.findIndex(fc => fc.comment.id === comment.id && fc.depth === 0)"
        :selected-index="selectedIndex"
      />

      <!-- Load more trigger (for intersection observer) -->
      <div
        v-if="hasMore"
        :ref="onTriggerRef"
        class="load-more-trigger"
      >
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

    <!-- Pending sequence indicator -->
    <div v-if="pendingSequence" class="pending-sequence">
      {{ pendingSequence }}
    </div>

    <!-- Keyboard hints for comments -->
    <div class="keyboard-hints">
      <span><kbd>j</kbd>/<kbd>k</kbd> navigate</span>
      <span><kbd>h</kbd>/<kbd>l</kbd> parent/child</span>
      <span><kbd>Enter</kbd> toggle</span>
      <span><kbd>?</kbd> help</span>
    </div>

    <!-- Keyboard Help Modal -->
    <Teleport to="body">
      <div v-if="showHelpModal" class="help-modal-overlay" @click.self="toggleHelpModal">
        <div class="help-modal">
          <div class="help-modal-header">
            <h2>Comment Keyboard Shortcuts</h2>
            <button class="help-modal-close" @click="toggleHelpModal">&times;</button>
          </div>
          <div class="help-modal-content">
            <div class="shortcut-section">
              <h3>Navigation</h3>
              <div class="shortcut-grid">
                <div class="shortcut"><kbd>j</kbd> / <kbd>k</kbd><span>Next / Previous comment</span></div>
                <div class="shortcut"><kbd>5j</kbd> / <kbd>5k</kbd><span>Move 5 comments</span></div>
                <div class="shortcut"><kbd>gg</kbd><span>Jump to first comment</span></div>
                <div class="shortcut"><kbd>G</kbd><span>Jump to last comment</span></div>
                <div class="shortcut"><kbd>Ctrl+d</kbd> / <kbd>Ctrl+u</kbd><span>Half page down / up</span></div>
                <div class="shortcut"><kbd>zz</kbd><span>Center selected comment</span></div>
              </div>
            </div>
            <div class="shortcut-section">
              <h3>Thread Navigation</h3>
              <div class="shortcut-grid">
                <div class="shortcut"><kbd>l</kbd><span>Enter thread (first reply)</span></div>
                <div class="shortcut"><kbd>h</kbd><span>Exit to parent comment</span></div>
                <div class="shortcut"><kbd>p</kbd><span>Jump to parent</span></div>
                <div class="shortcut"><kbd>[</kbd> / <kbd>]</kbd><span>Previous / Next sibling</span></div>
                <div class="shortcut"><kbd>{</kbd> / <kbd>}</kbd><span>Previous / Next root comment</span></div>
              </div>
            </div>
            <div class="shortcut-section">
              <h3>Folding</h3>
              <div class="shortcut-grid">
                <div class="shortcut"><kbd>Enter</kbd> / <kbd>za</kbd><span>Toggle collapse</span></div>
                <div class="shortcut"><kbd>zc</kbd><span>Collapse thread</span></div>
                <div class="shortcut"><kbd>zo</kbd><span>Expand thread</span></div>
                <div class="shortcut"><kbd>zM</kbd><span>Collapse all</span></div>
                <div class="shortcut"><kbd>zR</kbd><span>Expand all</span></div>
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
              </div>
            </div>
            <div class="shortcut-section">
              <h3>Other</h3>
              <div class="shortcut-grid">
                <div class="shortcut"><kbd>t</kbd><span>Toggle theme</span></div>
                <div class="shortcut"><kbd>Esc</kbd><span>Go back / Cancel</span></div>
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
.comment-thread {
  margin-top: var(--spacing-6);
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--border-default);
}

.thread-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.thread-actions {
  display: flex;
  gap: var(--spacing-2);
}

.thread-action-btn {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-tertiary);
  background: none;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.thread-action-btn:hover {
  color: var(--text-primary);
  border-color: var(--text-tertiary);
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

/* Keyboard hints */
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

.comment-thread:focus-within .keyboard-hints,
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
  .keyboard-hints {
    display: none;
  }

  .thread-actions {
    display: none;
  }

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
