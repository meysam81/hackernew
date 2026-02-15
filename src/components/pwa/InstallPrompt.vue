<script setup lang="ts">
import { ref, shallowRef, onMounted } from "vue";
import { Download, X } from "lucide-vue-next";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

const DISMISSED_KEY = "hackernew-pwa-dismissed";
const REPROMPT_DELAY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const showPrompt = ref(false);
const deferredPrompt = shallowRef<BeforeInstallPromptEvent | null>(null);

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const dismiss = () => {
  showPrompt.value = false;
  setLocalStorage(DISMISSED_KEY, Date.now());
};

const install = async () => {
  if (!deferredPrompt.value) {
    return;
  }

  deferredPrompt.value.prompt();
  const { outcome } = await deferredPrompt.value.userChoice;

  if (outcome === "accepted") {
    showPrompt.value = false;
  }
  deferredPrompt.value = null;
};

onMounted(() => {
  const dismissedAt = getLocalStorage(DISMISSED_KEY, 0);
  if (dismissedAt && Date.now() - dismissedAt < REPROMPT_DELAY_MS) {
    return;
  }

  // Check if event was already captured before hydration
  if ((window as any).__pwaInstallPrompt) {
    deferredPrompt.value = (window as any).__pwaInstallPrompt;
    showPrompt.value = true;
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt.value = e as BeforeInstallPromptEvent;
    showPrompt.value = true;
  });
});
</script>

<template>
  <Transition name="prompt">
    <div v-if="showPrompt" class="install-prompt" role="alert">
      <div class="prompt-content">
        <Download :size="18" class="prompt-icon" />
        <div class="prompt-text">
          <strong>Install HackerNew</strong>
          <span>Add to your home screen for quick access</span>
        </div>
      </div>
      <div class="prompt-actions">
        <button class="install-btn" @click="install">Install</button>
        <button class="dismiss-btn" aria-label="Dismiss" @click="dismiss">
          <X :size="16" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.install-prompt {
  position: fixed;
  bottom: var(--spacing-4);
  left: var(--spacing-4);
  right: var(--spacing-4);
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-install-prompt);
}

.prompt-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex: 1;
  min-width: 0;
}

.prompt-icon {
  color: var(--accent);
  flex-shrink: 0;
}

.prompt-text {
  display: flex;
  flex-direction: column;
  font-size: var(--text-sm);
  line-height: 1.3;
}

.prompt-text strong {
  color: var(--text-primary);
}

.prompt-text span {
  color: var(--text-secondary);
  font-size: var(--text-xs);
}

.prompt-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

.install-btn {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--text-sm);
  font-weight: 500;
  color: #fff;
  background-color: var(--accent);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.install-btn:hover {
  background-color: var(--accent-hover);
}

.dismiss-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dismiss-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.prompt-enter-active,
.prompt-leave-active {
  transition: all 300ms ease;
}

.prompt-enter-from,
.prompt-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
