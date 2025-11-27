<script setup lang="ts">
import { computed } from "vue";

interface Props {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  href?: string;
  external?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  disabled: false,
  loading: false,
  external: false,
});

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const classes = computed(() => [
  "btn",
  `btn-${props.variant}`,
  `btn-${props.size}`,
  {
    "btn-disabled": props.disabled || props.loading,
    "btn-loading": props.loading,
  },
]);

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit("click", event);
  }
};
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :class="classes"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="spinner"></span>
    <slot />
  </component>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-family: inherit;
  font-weight: 500;
  text-decoration: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Sizes */
.btn-sm {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--text-sm);
}

.btn-md {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-base);
}

.btn-lg {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--text-lg);
}

/* Variants */
.btn-primary {
  color: white;
  background-color: var(--accent);
}

.btn-primary:hover:not(.btn-disabled) {
  background-color: var(--accent-hover);
}

.btn-secondary {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-default);
}

.btn-secondary:hover:not(.btn-disabled) {
  background-color: var(--bg-secondary);
  border-color: var(--border-default);
}

.btn-ghost {
  color: var(--text-secondary);
  background: transparent;
}

.btn-ghost:hover:not(.btn-disabled) {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

/* States */
.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  position: relative;
  color: transparent;
}

.spinner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
