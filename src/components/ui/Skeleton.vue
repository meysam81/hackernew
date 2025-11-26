<script setup lang="ts">
interface Props {
  width?: string;
  height?: string;
  rounded?: boolean;
}

withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '1rem',
  rounded: false,
});
</script>

<template>
  <div
    class="skeleton"
    :class="{ 'skeleton-rounded': rounded }"
    :style="{ width, height }"
  ></div>
</template>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 25%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

.skeleton-rounded {
  border-radius: 50%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
