import { ref, readonly } from "vue";

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  duration: number;
}

// Module-level shared state
const toasts = ref<Toast[]>([]);
const MAX_TOASTS = 5;

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function useToast() {
  const addToast = (
    type: Toast["type"],
    message: string,
    duration = 3000
  ): string => {
    const id = generateId();

    // Remove oldest toast if at max
    if (toasts.value.length >= MAX_TOASTS) {
      toasts.value.shift();
    }

    toasts.value.push({ id, type, message, duration });

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id: string): void => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const clearAll = (): void => {
    toasts.value = [];
  };

  // Convenience methods
  const success = (message: string, duration?: number) =>
    addToast("success", message, duration);

  const error = (message: string, duration?: number) =>
    addToast("error", message, duration ?? 5000);

  const info = (message: string, duration?: number) =>
    addToast("info", message, duration);

  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    info,
  };
}
