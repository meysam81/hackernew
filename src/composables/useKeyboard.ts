import { ref, onMounted, onUnmounted } from "vue";
import log from "@/utils/logger";

interface KeyboardOptions {
  onNavigate?: (direction: "up" | "down") => void;
  onOpen?: () => void;
  onOpenComments?: () => void;
  onBookmark?: () => void;
  onBack?: () => void;
  enabled?: boolean;
}

export function useKeyboard(options: KeyboardOptions = {}) {
  const {
    onNavigate,
    onOpen,
    onOpenComments,
    onBookmark,
    onBack,
    enabled = true,
  } = options;

  const isEnabled = ref(enabled);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isEnabled.value) {
      return;
    }

    // Don't capture when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case "j":
        event.preventDefault();
        onNavigate?.("down");
        break;
      case "k":
        event.preventDefault();
        onNavigate?.("up");
        break;
      case "o":
      case "enter":
        if (!event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          onOpen?.();
        }
        break;
      case "c":
        event.preventDefault();
        onOpenComments?.();
        break;
      case "b":
        event.preventDefault();
        onBookmark?.();
        break;
      case "escape":
      case "backspace":
        if (event.key === "backspace" && !event.metaKey) {
          break;
        }
        event.preventDefault();
        onBack?.();
        break;
      default:
        log.debug(`Unhandled key: ${event.key}`);
        break;
    }
  };

  const enable = () => {
    isEnabled.value = true;
  };

  const disable = () => {
    isEnabled.value = false;
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  return {
    isEnabled,
    enable,
    disable,
  };
}

export type ShortcutCategory = "navigation" | "actions" | "general";

export interface KeyboardShortcut {
  key: string;
  description: string;
  category: ShortcutCategory;
}

// Keyboard shortcuts help
export const keyboardShortcuts: KeyboardShortcut[] = [
  { key: "j", description: "Next story", category: "navigation" },
  { key: "k", description: "Previous story", category: "navigation" },
  { key: "o / Enter", description: "Open story link", category: "actions" },
  { key: "c", description: "Open comments", category: "actions" },
  { key: "b", description: "Toggle bookmark", category: "actions" },
  { key: "Esc", description: "Go back", category: "general" },
  { key: "?", description: "Show shortcuts", category: "general" },
  { key: "\u2318K / Ctrl+K", description: "Search", category: "general" },
];
