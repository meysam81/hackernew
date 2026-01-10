<script setup lang="ts">
import { X, CheckCircle, AlertCircle, Info } from "lucide-vue-next";
import { useToast } from "@/composables/useToast";

const { toasts, removeToast } = useToast();

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`]"
          role="alert"
        >
          <component :is="icons[toast.type]" :size="18" class="toast-icon" />
          <span class="toast-message">{{ toast.message }}</span>
          <button
            class="toast-close"
            @click="removeToast(toast.id)"
            aria-label="Dismiss"
          >
            <X :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: var(--spacing-4);
  right: var(--spacing-4);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  max-width: 360px;
}

.toast-success {
  border-color: #22c55e;
}

.toast-success .toast-icon {
  color: #22c55e;
}

.toast-error {
  border-color: #ef4444;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-info {
  border-color: var(--accent);
}

.toast-info .toast-icon {
  color: var(--accent);
}

.toast-message {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.toast-close {
  display: flex;
  padding: var(--spacing-1);
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
}

.toast-close:hover {
  color: var(--text-primary);
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (max-width: 480px) {
  .toast-container {
    left: var(--spacing-4);
    right: var(--spacing-4);
    bottom: var(--spacing-4);
  }

  .toast {
    max-width: none;
  }
}
</style>
