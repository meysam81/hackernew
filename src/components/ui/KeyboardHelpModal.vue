<script setup lang="ts">
import { watch, onMounted, onUnmounted, ref } from "vue";
import { X } from "lucide-vue-next";
import { useModal } from "@/composables/useModal";
import { keyboardShortcuts } from "@/composables/useKeyboard";

const { keyboardHelpVisible, hideKeyboardHelp } = useModal();
const modalRef = ref<HTMLElement | null>(null);

// Focus trap
const handleTab = (event: KeyboardEvent) => {
  if (!keyboardHelpVisible.value || !modalRef.value) return;

  const focusableElements = modalRef.value.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
};

// Close on backdrop click
const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    hideKeyboardHelp();
  }
};

// Manage body scroll lock
watch(keyboardHelpVisible, (visible) => {
  if (visible) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});

onMounted(() => {
  window.addEventListener("keydown", handleTab);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleTab);
  document.body.style.overflow = "";
});

// Extended shortcuts for display
const allShortcuts = [
  ...keyboardShortcuts,
  { key: "/", description: "Open search" },
  { key: "Cmd+K", description: "Open search" },
];
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="keyboardHelpVisible"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-help-title"
        @click="handleBackdropClick"
      >
        <div ref="modalRef" class="modal-content">
          <div class="modal-header">
            <h2 id="keyboard-help-title" class="modal-title">
              Keyboard Shortcuts
            </h2>
            <button
              class="close-btn"
              aria-label="Close"
              @click="hideKeyboardHelp"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="shortcuts-grid">
            <div
              v-for="shortcut in allShortcuts"
              :key="shortcut.key"
              class="shortcut-item"
            >
              <kbd class="shortcut-key">{{ shortcut.key }}</kbd>
              <span class="shortcut-desc">{{ shortcut.description }}</span>
            </div>
          </div>

          <div class="modal-footer">
            <p class="hint">Press <kbd>Esc</kbd> to close</p>
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
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
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
  border-bottom: 1px solid var(--border-default);
}

.modal-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-1);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.close-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3);
  padding: var(--spacing-6);
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.shortcut-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: var(--spacing-1) var(--spacing-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
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
  border-top: 1px solid var(--border-default);
}

.hint {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-align: center;
}

.hint kbd {
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: 4px;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-fast);
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform var(--transition-fast);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}

@media (max-width: 480px) {
  .shortcuts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
