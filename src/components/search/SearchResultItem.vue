<script setup lang="ts">
import { computed } from "vue";
import { MessageSquare, ArrowUpRight, Clock } from "lucide-vue-next";
import type { AlgoliaHit } from "@/lib/algolia-client";
import { timeAgo } from "@/lib/utils";

interface Props {
  hit: AlgoliaHit;
  selected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
});

const basePath = import.meta.env.BASE_URL || "/";

const isComment = computed(() => props.hit._tags.includes("comment"));
const isStory = computed(() => props.hit._tags.includes("story"));

const sanitizeHighlight = (html: string): string => {
  return html.replace(/<(?!\/?em\b)[^>]*>/g, "").trim();
};

const title = computed(() => {
  if (isComment.value) {
    return props.hit.story_title || "Comment";
  }
  return props.hit.title || "";
});

const highlightedTitle = computed(() => {
  if (isComment.value && props.hit._highlightResult?.story_title) {
    return sanitizeHighlight(props.hit._highlightResult.story_title.value);
  }
  if (props.hit._highlightResult?.title) {
    return sanitizeHighlight(props.hit._highlightResult.title.value);
  }
  return title.value;
});

const snippet = computed(() => {
  if (isComment.value && props.hit._highlightResult?.comment_text) {
    // Strip HTML tags except <em> for highlight
    const raw = props.hit._highlightResult.comment_text.value;
    return raw
      .replace(/<(?!\/?em\b)[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200);
  }
  if (props.hit._highlightResult?.story_text) {
    const raw = props.hit._highlightResult.story_text.value;
    return raw
      .replace(/<(?!\/?em\b)[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200);
  }
  return "";
});

const domain = computed(() => {
  const url = props.hit.url || props.hit.story_url;
  if (!url) {
    return "";
  }
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
});

const itemUrl = computed(() => {
  if (isComment.value) {
    return `${basePath}item/${props.hit.story_id || props.hit.objectID}`;
  }
  return `${basePath}item/${props.hit.objectID}`;
});

const timeStr = computed(() => timeAgo(props.hit.created_at_i));
</script>

<template>
  <a
    :href="itemUrl"
    class="result-item"
    :class="{ selected }"
    role="option"
    :aria-selected="selected"
  >
    <div class="result-header">
      <span v-if="isComment" class="result-badge comment-badge">
        <MessageSquare :size="10" />
        Comment
      </span>
      <span v-else-if="isStory" class="result-badge story-badge">
        <ArrowUpRight :size="10" />
        Story
      </span>
    </div>

    <div class="result-title" v-html="highlightedTitle"></div>

    <div v-if="snippet" class="result-snippet" v-html="snippet"></div>

    <div class="result-meta">
      <span v-if="hit.author" class="meta-author">{{ hit.author }}</span>
      <span v-if="hit.points !== null && !isComment" class="meta-points">
        {{ hit.points }} pts
      </span>
      <span
        v-if="hit.num_comments !== null && !isComment"
        class="meta-comments"
      >
        {{ hit.num_comments }} comments
      </span>
      <span v-if="domain" class="meta-domain">{{ domain }}</span>
      <span class="meta-time">
        <Clock :size="10" />
        {{ timeStr }}
      </span>
    </div>
  </a>
</template>

<style scoped>
.result-item {
  display: block;
  padding: var(--spacing-3) var(--spacing-4);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
  cursor: pointer;
}

.result-item:hover,
.result-item.selected {
  background-color: var(--bg-tertiary);
}

.result-header {
  margin-bottom: var(--spacing-1);
}

.result-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1px 6px;
  border-radius: 3px;
}

.story-badge {
  color: var(--accent);
  background-color: var(--accent-muted);
}

.comment-badge {
  color: var(--text-secondary);
  background-color: var(--bg-tertiary);
}

.result-title {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: var(--spacing-1);
}

.result-title :deep(em) {
  font-style: normal;
  background-color: var(--accent-muted);
  color: var(--accent);
  padding: 0 2px;
  border-radius: 2px;
}

.result-snippet {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: var(--spacing-1);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.result-snippet :deep(em) {
  font-style: normal;
  background-color: var(--accent-muted);
  color: var(--accent);
  padding: 0 2px;
  border-radius: 2px;
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.meta-time {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.meta-author {
  font-weight: 500;
  color: var(--text-secondary);
}
</style>
