<script setup lang="ts">
import Skeleton from '../ui/Skeleton.vue';

interface Props {
  count?: number;
}

withDefaults(defineProps<Props>(), {
  count: 5,
});
</script>

<template>
  <div class="comment-skeleton-list">
    <div v-for="i in count" :key="i" class="comment-skeleton" :style="{ marginLeft: `${(i % 3) * 16}px` }">
      <div class="skeleton-header">
        <Skeleton width="80px" height="14px" />
        <Skeleton width="50px" height="14px" />
      </div>
      <div class="skeleton-body">
        <Skeleton width="100%" height="14px" />
        <Skeleton :width="`${70 + Math.random() * 20}%`" height="14px" />
        <Skeleton v-if="i % 2 === 0" :width="`${40 + Math.random() * 30}%`" height="14px" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-skeleton-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.comment-skeleton {
  padding: var(--spacing-2) 0;
}

.skeleton-header {
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.skeleton-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}
</style>
