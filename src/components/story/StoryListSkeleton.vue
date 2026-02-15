<script setup lang="ts">
import Skeleton from "../ui/Skeleton.vue";

interface Props {
  count?: number;
}

withDefaults(defineProps<Props>(), {
  count: 10,
});
</script>

<template>
  <div class="story-list-skeleton">
    <div v-for="i in count" :key="i" class="story-skeleton">
      <div class="skeleton-rank">
        <Skeleton width="20px" height="16px" />
      </div>
      <div class="skeleton-vote">
        <Skeleton width="24px" height="24px" />
      </div>
      <div class="skeleton-content">
        <div class="skeleton-title">
          <Skeleton :width="`${60 + ((i * 17 + 7) % 30)}%`" height="18px" />
        </div>
        <div class="skeleton-meta">
          <Skeleton width="60px" height="14px" />
          <Skeleton width="80px" height="14px" />
          <Skeleton width="50px" height="14px" />
          <Skeleton width="70px" height="14px" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.story-list-skeleton {
  display: flex;
  flex-direction: column;
}

.story-skeleton {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  padding: var(--spacing-3) 0;
  border-bottom: 1px solid var(--border-subtle);
}

.skeleton-rank {
  min-width: 28px;
  display: flex;
  justify-content: flex-end;
}

.skeleton-vote {
  display: flex;
}

.skeleton-content {
  flex: 1;
}

.skeleton-title {
  margin-bottom: var(--spacing-2);
}

.skeleton-meta {
  display: flex;
  gap: var(--spacing-3);
}

@media (max-width: 640px) {
  .skeleton-rank {
    display: none;
  }
}
</style>
