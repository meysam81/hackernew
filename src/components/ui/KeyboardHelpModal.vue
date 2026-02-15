<script lang="ts">
export default { inheritAttrs: false };
</script>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { X } from "lucide-vue-next";
import {
  keyboardShortcuts,
  type ShortcutCategory,
} from "@/composables/useKeyboard";
import { useFocusTrap } from "@/composables/useFocusTrap";

const isOpen = ref(false);
const modalRef = ref<HTMLElement | null>(null);
const { activate, deactivate } = useFocusTrap(modalRef);

watch(isOpen, (open) => {
  document.body.style.overflow = open ? "hidden" : "";
  if (open) {
    nextTick(() => activate());
  } else {
    deactivate();
  }
});

const categories: { key: ShortcutCategory; label: string }[] = [
  { key: "navigation", label: "Navigation" },
  { key: "actions", label: "Actions" },
  { key: "general", label: "General" },
];

const groupedShortcuts = computed(() => {
  const groups: Record<ShortcutCategory, typeof keyboardShortcuts> = {
    navigation: [],
    actions: [],
    general: [],
  };
  for (const shortcut of keyboardShortcuts) {
    groups[shortcut.category].push(shortcut);
  }
  return groups;
});

const open = () => {
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isOpen.value) {
    event.preventDefault();
    event.stopPropagation();
    close();
    return;
  }
  if (event.key === "?" && !isOpen.value) {
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }
    event.preventDefault();
    open();
  }
};

const handleBackdropClick = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains("modal-overlay")) {
    close();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown, true);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown, true);
  document.body.style.overflow = "";
});

defineExpose({ open, close });
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        @click="handleBackdropClick"
      >
        <div ref="modalRef" class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Keyboard Shortcuts</h2>
            <button class="close-btn" aria-label="Close" @click="close">
              <X :size="18" />
            </button>
          </div>

          <div class="modal-body">
            <div
              v-for="category in categories"
              :key="category.key"
              class="shortcut-group"
            >
              <h3 class="group-title">{{ category.label }}</h3>
              <div class="shortcut-list">
                <div
                  v-for="shortcut in groupedShortcuts[category.key]"
                  :key="shortcut.key"
                  class="shortcut-item"
                >
                  <div class="shortcut-keys">
                    <kbd v-for="(key, i) in shortcut.key.split(' / ')" :key="i">
                      {{ key }}
                    </kbd>
                  </div>
                  <span class="shortcut-desc">{{ shortcut.description }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-keyboard-help);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: var(--spacing-4);
}

.modal-content {
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--border-default);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.modal-body {
  padding: var(--spacing-4) var(--spacing-6);
}

.shortcut-group {
  margin-bottom: var(--spacing-4);
}

.shortcut-group:last-child {
  margin-bottom: 0;
}

.group-title {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--spacing-2);
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-1) 0;
}

.shortcut-keys {
  display: flex;
  gap: var(--spacing-1);
}

.shortcut-keys kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 var(--spacing-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: 4px;
  box-shadow: 0 1px 0 var(--border-default);
}

.shortcut-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 150ms ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 150ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>
