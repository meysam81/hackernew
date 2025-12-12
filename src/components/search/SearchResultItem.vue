<script setup lang="ts">
import { computed } from "vue";
import { MessageSquare, ExternalLink, User, Clock } from "lucide-vue-next";
import type { AlgoliaHit } from "@/lib/algolia-client";
import {
  getHitTitle,
  getHitUrl,
  getDomain,
  getItemId,
  getStoryId,
  isComment,
  formatTimeAgo,
} from "@/lib/algolia-client";

interface Props {
  hit: AlgoliaHit;
  selected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
});

const emit = defineEmits<{
  (e: "select"): void;
}>();

const basePath = import.meta.env.BASE_URL || "/";

const title = computed(() => getHitTitle(props.hit));
const url = computed(() => getHitUrl(props.hit));
const domain = computed(() => getDomain(url.value));
const itemId = computed(() => getItemId(props.hit));
const storyId = computed(() => getStoryId(props.hit));
const isCommentHit = computed(() => isComment(props.hit));
const timeAgo = computed(() => formatTimeAgo(props.hit.created_at_i));

const itemUrl = computed(() => `${basePath}item/${storyId.value}`);

// Strip HTML tags from comment text for preview
const commentPreview = computed(() => {
  if (!props.hit.comment_text) return "";
  const stripped = props.hit.comment_text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length > 150 ? stripped.slice(0, 150) + "..." : stripped;
});

const handleClick = () => {
  emit("select");
};
</script>

<template>
  <div
    class="search-result"
    :class="{ selected }"
    role="option"
    :aria-selected="selected"
    @click="handleClick"
  >
    <div class="result-content">
      <!-- Story result -->
      <template v-if="!isCommentHit">
        <div class="result-title">
          <a :href="url || itemUrl" target="_blank" rel="noopener noreferrer">
            {{ title }}
          </a>
          <span v-if="domain" class="result-domain">({{ domain }})</span>
        </div>
        <div class="result-meta">
          <span v-if="hit.points" class="meta-item">
            {{ hit.points }} points
          </span>
          <span class="meta-item">
            <User :size="12" />
            {{ hit.author }}
          </span>
          <span class="meta-item">
            <Clock :size="12" />
            {{ timeAgo }}
          </span>
          <a :href="itemUrl" class="meta-item meta-link">
            <MessageSquare :size="12" />
            {{ hit.num_comments ?? 0 }} comments
          </a>
        </div>
      </template>

      <!-- Comment result -->
      <template v-else>
        <div class="result-comment">
          <div class="comment-context">
            <span class="comment-label">Comment on:</span>
            <a :href="itemUrl" class="comment-story-title">
              {{ hit.story_title || "Unknown story" }}
            </a>
          </div>
          <p class="comment-preview">{{ commentPreview }}</p>
          <div class="result-meta">
            <span class="meta-item">
              <User :size="12" />
              {{ hit.author }}
            </span>
            <span class="meta-item">
              <Clock :size="12" />
              {{ timeAgo }}
            </span>
            <a :href="itemUrl" class="meta-item meta-link">
              <ExternalLink :size="12" />
              View thread
            </a>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.search-result {
  padding: var(--spacing-3) var(--spacing-4);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}

.search-result:hover,
.search-result.selected {
  background-color: var(--bg-tertiary);
}

.search-result.selected {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.result-title {
  font-size: var(--text-base);
  line-height: 1.4;
}

.result-title a {
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
}

.result-title a:hover {
  color: var(--accent);
}

.result-domain {
  margin-left: var(--spacing-2);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.meta-link:hover {
  color: var(--accent);
}

.result-comment {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.comment-context {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  font-size: var(--text-sm);
}

.comment-label {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.comment-story-title {
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
}

.comment-story-title:hover {
  color: var(--accent);
}

.comment-preview {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>
