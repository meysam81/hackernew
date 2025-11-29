<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { X } from "lucide-vue-next";
import { isHelpModalOpen, closeHelpModal, keyboardShortcuts } from "@/composables/useKeyboard";

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeHelpModal();
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isHelpModalOpen.value) {
    event.preventDefault();
    closeHelpModal();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

// Manage body scroll lock when modal is open
watch(isHelpModalOpen, (open) => {
  if (open) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isHelpModalOpen"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-help-title"
        @click="handleBackdropClick"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="keyboard-help-title" class="modal-title">Keyboard Shortcuts</h2>
            <button
              class="modal-close"
              @click="closeHelpModal"
              aria-label="Close"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="shortcuts-grid">
            <div
              v-for="shortcut in keyboardShortcuts"
              :key="shortcut.key"
              class="shortcut-item"
            >
              <kbd class="shortcut-key">{{ shortcut.key }}</kbd>
              <span class="shortcut-desc">{{ shortcut.description }}</span>
            </div>
          </div>

          <div class="modal-footer">
            <span class="footer-hint">Press <kbd>?</kbd> or <kbd>Esc</kbd> to close</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.dark .modal-backdrop {
  background-color: rgba(0, 0, 0, 0.7);
}

.modal-content {
  width: 100%;
  max-width: 400px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--border-subtle);
}

.modal-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.shortcuts-grid {
  display: grid;
  gap: var(--spacing-1);
  padding: var(--spacing-4) var(--spacing-6);
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-2) 0;
}

.shortcut-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 28px;
  padding: 0 var(--spacing-2);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
}

.shortcut-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.modal-footer {
  padding: var(--spacing-3) var(--spacing-6);
  background-color: var(--bg-tertiary);
  border-top: 1px solid var(--border-subtle);
}

.footer-hint {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.footer-hint kbd {
  display: inline-block;
  padding: 1px 5px;
  font-family: var(--font-mono);
  font-size: 10px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: 3px;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-normal);
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform var(--transition-normal);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .modal-content,
  .modal-leave-active .modal-content {
    transition: none;
  }
}
</style>
