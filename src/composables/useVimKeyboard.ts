import { ref, computed, onMounted, onUnmounted, readonly } from "vue";
import log from "@/utils/logger";

// ============================================================================
// Types
// ============================================================================

export type NavigationContext = "feed" | "comments" | "global";

export interface VimKeyboardOptions {
  // Feed navigation
  onNavigate?: (direction: "up" | "down", count: number) => void;
  onJumpToFirst?: () => void;
  onJumpToLast?: () => void;
  onJumpToPosition?: (position: "top" | "middle" | "bottom") => void;
  onPageScroll?: (direction: "up" | "down") => void;
  onCenterSelected?: () => void;

  // Actions
  onOpen?: () => void;
  onOpenComments?: () => void;
  onBookmark?: () => void;
  onMarkAsRead?: () => void;
  onRefresh?: () => void;
  onBack?: () => void;
  onOpenUserProfile?: () => void;
  onYankUrl?: (type: "story" | "comments") => void;

  // Comment-specific navigation
  onCommentNavigate?: (direction: "up" | "down", count: number) => void;
  onCommentParent?: () => void;
  onCommentNextSibling?: () => void;
  onCommentPrevSibling?: () => void;
  onCommentNextRoot?: () => void;
  onCommentPrevRoot?: () => void;
  onCommentToggleFold?: () => void;
  onCommentFold?: () => void;
  onCommentUnfold?: () => void;
  onCommentFoldAll?: () => void;
  onCommentUnfoldAll?: () => void;
  onCommentEnter?: () => void;
  onCommentExit?: () => void;

  // Global navigation
  onGoTo?: (destination: string) => void;
  onSearch?: () => void;
  onSearchNext?: () => void;
  onSearchPrev?: () => void;
  onToggleTheme?: () => void;
  onToggleDensity?: () => void;
  onShowHelp?: () => void;

  // Pagination
  onNextPage?: () => void;
  onPrevPage?: () => void;

  // Configuration
  context?: NavigationContext;
  enabled?: boolean;
}

interface KeySequence {
  prefix: string | null;
  count: number;
  timeout: ReturnType<typeof setTimeout> | null;
}

// ============================================================================
// Shared State (Module Level)
// ============================================================================

const keySequence = ref<KeySequence>({
  prefix: null,
  count: 0,
  timeout: null,
});

const pendingDisplay = computed(() => {
  const seq = keySequence.value;
  let display = "";
  if (seq.count > 0) display += seq.count;
  if (seq.prefix) display += seq.prefix;
  return display;
});

const SEQUENCE_TIMEOUT = 1000; // 1 second timeout for key sequences

// ============================================================================
// Key Sequence State Machine
// ============================================================================

function clearSequence() {
  if (keySequence.value.timeout) {
    clearTimeout(keySequence.value.timeout);
  }
  keySequence.value = {
    prefix: null,
    count: 0,
    timeout: null,
  };
}

function setSequenceTimeout() {
  if (keySequence.value.timeout) {
    clearTimeout(keySequence.value.timeout);
  }
  keySequence.value.timeout = setTimeout(() => {
    log.debug("Key sequence timeout, clearing");
    clearSequence();
  }, SEQUENCE_TIMEOUT);
}

function addToCount(digit: number) {
  // Prevent leading zeros from being meaningful
  if (keySequence.value.count === 0 && digit === 0) {
    return false;
  }
  // Cap at reasonable number to prevent overflow
  const newCount = keySequence.value.count * 10 + digit;
  if (newCount > 999) {
    return false;
  }
  keySequence.value.count = newCount;
  setSequenceTimeout();
  return true;
}

function setPrefix(prefix: string) {
  keySequence.value.prefix = prefix;
  setSequenceTimeout();
}

function getCountOrDefault(defaultCount: number = 1): number {
  return keySequence.value.count > 0 ? keySequence.value.count : defaultCount;
}

// ============================================================================
// Go-to destination mapping
// ============================================================================

const GO_TO_DESTINATIONS: Record<string, string> = {
  t: "/",       // Top stories (home)
  h: "/",       // Home (alias)
  n: "/new",    // New stories
  a: "/ask",    // Ask HN
  s: "/show",   // Show HN
  j: "/jobs",   // Jobs
  b: "/bookmarks", // Bookmarks
};

// ============================================================================
// Main Composable
// ============================================================================

export function useVimKeyboard(options: VimKeyboardOptions = {}) {
  const {
    onNavigate,
    onJumpToFirst,
    onJumpToLast,
    onJumpToPosition,
    onPageScroll,
    onCenterSelected,
    onOpen,
    onOpenComments,
    onBookmark,
    onMarkAsRead,
    onRefresh,
    onBack,
    onOpenUserProfile,
    onYankUrl,
    onCommentNavigate,
    onCommentParent,
    onCommentNextSibling,
    onCommentPrevSibling,
    onCommentNextRoot,
    onCommentPrevRoot,
    onCommentToggleFold,
    onCommentFold,
    onCommentUnfold,
    onCommentFoldAll,
    onCommentUnfoldAll,
    onCommentEnter,
    onCommentExit,
    onGoTo,
    onSearch,
    onSearchNext,
    onSearchPrev,
    onToggleTheme,
    onToggleDensity,
    onShowHelp,
    onNextPage,
    onPrevPage,
    context = "feed",
    enabled = true,
  } = options;

  const isEnabled = ref(enabled);
  const currentContext = ref<NavigationContext>(context);

  // Handle 'g' prefix sequences
  const handleGSequence = (key: string): boolean => {
    switch (key) {
      case "g":
        // gg - jump to first
        onJumpToFirst?.();
        return true;
      case "t":
      case "h":
      case "n":
      case "a":
      case "s":
      case "j":
      case "b":
        // g{letter} - go to destination
        const destination = GO_TO_DESTINATIONS[key];
        if (destination) {
          onGoTo?.(destination);
        }
        return true;
      case "u":
        // gu - go to user profile
        onOpenUserProfile?.();
        return true;
      default:
        return false;
    }
  };

  // Handle 'z' prefix sequences (folding)
  const handleZSequence = (key: string): boolean => {
    switch (key) {
      case "z":
        // zz - center selected item
        onCenterSelected?.();
        return true;
      case "a":
        // za - toggle fold
        onCommentToggleFold?.();
        return true;
      case "c":
        // zc - fold/collapse
        onCommentFold?.();
        return true;
      case "o":
        // zo - unfold/open
        onCommentUnfold?.();
        return true;
      case "m":
        // zM - fold all
        onCommentFoldAll?.();
        return true;
      case "r":
        // zR - unfold all
        onCommentUnfoldAll?.();
        return true;
      default:
        return false;
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isEnabled.value) return;

    // Don't capture when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }

    const key = event.key;
    const keyLower = key.toLowerCase();
    const hasCtrl = event.ctrlKey || event.metaKey;
    const hasShift = event.shiftKey;

    // Check if we have an active prefix sequence
    const prefix = keySequence.value.prefix;

    // Handle prefix sequences first
    if (prefix === "g") {
      event.preventDefault();
      handleGSequence(keyLower);
      clearSequence();
      return;
    }

    if (prefix === "z") {
      event.preventDefault();
      handleZSequence(keyLower);
      clearSequence();
      return;
    }

    // Handle number accumulation (for count prefixes like 5j)
    if (/^[1-9]$/.test(key) || (key === "0" && keySequence.value.count > 0)) {
      event.preventDefault();
      addToCount(parseInt(key, 10));
      return;
    }

    // Get the count for motion commands
    const count = getCountOrDefault(1);

    // Handle key based on current context
    switch (keyLower) {
      // ========================================
      // Navigation (works in both feed and comments)
      // ========================================
      case "j":
        event.preventDefault();
        if (currentContext.value === "comments") {
          onCommentNavigate?.("down", count);
        } else {
          onNavigate?.("down", count);
        }
        clearSequence();
        break;

      case "k":
        event.preventDefault();
        if (currentContext.value === "comments") {
          onCommentNavigate?.("up", count);
        } else {
          onNavigate?.("up", count);
        }
        clearSequence();
        break;

      // ========================================
      // Vim motions
      // ========================================
      case "g":
        // Start 'g' sequence
        event.preventDefault();
        setPrefix("g");
        break;

      case "G": // Shift+g
        event.preventDefault();
        onJumpToLast?.();
        clearSequence();
        break;

      // ========================================
      // Screen-relative navigation (H/M/L)
      // ========================================
      case "h":
        if (hasShift || key === "H") {
          event.preventDefault();
          onJumpToPosition?.("top");
          clearSequence();
        } else if (currentContext.value === "comments") {
          // h in comments = exit/collapse thread
          event.preventDefault();
          onCommentExit?.();
          clearSequence();
        }
        break;

      case "m":
        if (hasShift || key === "M") {
          event.preventDefault();
          onJumpToPosition?.("middle");
          clearSequence();
        } else {
          // m = mark as read
          event.preventDefault();
          onMarkAsRead?.();
          clearSequence();
        }
        break;

      case "l":
        if (hasShift || key === "L") {
          event.preventDefault();
          onJumpToPosition?.("bottom");
          clearSequence();
        } else if (currentContext.value === "comments") {
          // l in comments = enter thread
          event.preventDefault();
          onCommentEnter?.();
          clearSequence();
        }
        break;

      // ========================================
      // Page scrolling
      // ========================================
      case "d":
        if (hasCtrl) {
          event.preventDefault();
          onPageScroll?.("down");
          clearSequence();
        } else if (currentContext.value === "feed") {
          // d in feed = toggle density
          event.preventDefault();
          onToggleDensity?.();
          clearSequence();
        }
        break;

      case "u":
        if (hasCtrl) {
          event.preventDefault();
          onPageScroll?.("up");
          clearSequence();
        } else {
          // u = open user profile
          event.preventDefault();
          onOpenUserProfile?.();
          clearSequence();
        }
        break;

      // ========================================
      // Folding (z prefix)
      // ========================================
      case "z":
        event.preventDefault();
        setPrefix("z");
        break;

      // ========================================
      // Actions
      // ========================================
      case "o":
      case "enter":
        if (!hasCtrl && key !== "Enter") {
          event.preventDefault();
          onOpen?.();
          clearSequence();
        } else if (key === "Enter" && currentContext.value === "comments") {
          event.preventDefault();
          onCommentToggleFold?.();
          clearSequence();
        } else if (key === "Enter") {
          event.preventDefault();
          onOpen?.();
          clearSequence();
        }
        break;

      case "c":
        event.preventDefault();
        onOpenComments?.();
        clearSequence();
        break;

      case "b":
        event.preventDefault();
        onBookmark?.();
        clearSequence();
        break;

      case "r":
        event.preventDefault();
        onRefresh?.();
        clearSequence();
        break;

      case "t":
        event.preventDefault();
        onToggleTheme?.();
        clearSequence();
        break;

      // ========================================
      // Yank (copy URLs)
      // ========================================
      case "y":
        event.preventDefault();
        if (hasShift || key === "Y") {
          onYankUrl?.("comments");
        } else {
          onYankUrl?.("story");
        }
        clearSequence();
        break;

      // ========================================
      // Search
      // ========================================
      case "/":
        event.preventDefault();
        onSearch?.();
        clearSequence();
        break;

      case "n":
        event.preventDefault();
        if (hasShift || key === "N") {
          onSearchPrev?.();
        } else {
          onSearchNext?.();
        }
        clearSequence();
        break;

      // ========================================
      // Pagination
      // ========================================
      case "[":
        event.preventDefault();
        if (currentContext.value === "comments") {
          onCommentPrevSibling?.();
        } else {
          onPrevPage?.();
        }
        clearSequence();
        break;

      case "]":
        event.preventDefault();
        if (currentContext.value === "comments") {
          onCommentNextSibling?.();
        } else {
          onNextPage?.();
        }
        clearSequence();
        break;

      case "{":
        event.preventDefault();
        onCommentPrevRoot?.();
        clearSequence();
        break;

      case "}":
        event.preventDefault();
        onCommentNextRoot?.();
        clearSequence();
        break;

      // ========================================
      // Comment-specific
      // ========================================
      case "p":
        if (currentContext.value === "comments") {
          event.preventDefault();
          onCommentParent?.();
          clearSequence();
        }
        break;

      // ========================================
      // Navigation / Back
      // ========================================
      case "escape":
        event.preventDefault();
        if (keySequence.value.prefix || keySequence.value.count > 0) {
          // Cancel pending sequence
          clearSequence();
        } else {
          onBack?.();
        }
        break;

      case "backspace":
        if (hasCtrl || event.metaKey) {
          event.preventDefault();
          onBack?.();
        }
        clearSequence();
        break;

      // ========================================
      // Help
      // ========================================
      case "?":
        event.preventDefault();
        onShowHelp?.();
        clearSequence();
        break;

      default:
        // Unknown key, clear any pending sequence
        if (keySequence.value.prefix || keySequence.value.count > 0) {
          log.debug(`Unknown key in sequence: ${key}`);
          clearSequence();
        }
        break;
    }
  };

  const enable = () => {
    isEnabled.value = true;
  };

  const disable = () => {
    isEnabled.value = false;
    clearSequence();
  };

  const setContext = (ctx: NavigationContext) => {
    currentContext.value = ctx;
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
    clearSequence();
  });

  return {
    isEnabled: readonly(isEnabled),
    currentContext: readonly(currentContext),
    pendingSequence: pendingDisplay,
    enable,
    disable,
    setContext,
    clearSequence,
  };
}

// ============================================================================
// Keyboard Shortcuts Documentation
// ============================================================================

export interface KeyboardShortcut {
  key: string;
  description: string;
  category: "navigation" | "actions" | "goto" | "comments" | "other";
  context?: NavigationContext;
}

export const keyboardShortcuts: KeyboardShortcut[] = [
  // Navigation
  { key: "j", description: "Next item", category: "navigation" },
  { key: "k", description: "Previous item", category: "navigation" },
  { key: "5j / 5k", description: "Move 5 items", category: "navigation" },
  { key: "gg", description: "Jump to first item", category: "navigation" },
  { key: "G", description: "Jump to last item", category: "navigation" },
  { key: "H", description: "First visible item", category: "navigation" },
  { key: "M", description: "Middle visible item", category: "navigation" },
  { key: "L", description: "Last visible item", category: "navigation" },
  { key: "Ctrl+d", description: "Scroll half page down", category: "navigation" },
  { key: "Ctrl+u", description: "Scroll half page up", category: "navigation" },
  { key: "zz", description: "Center selected item", category: "navigation" },
  { key: "[", description: "Previous page", category: "navigation" },
  { key: "]", description: "Next page / Load more", category: "navigation" },

  // Actions
  { key: "o / Enter", description: "Open story link", category: "actions" },
  { key: "c", description: "Open comments", category: "actions" },
  { key: "b", description: "Toggle bookmark", category: "actions" },
  { key: "m", description: "Mark as read", category: "actions" },
  { key: "r", description: "Refresh feed", category: "actions" },
  { key: "u", description: "View author profile", category: "actions" },
  { key: "y", description: "Copy story URL", category: "actions" },
  { key: "Y", description: "Copy comments URL", category: "actions" },
  { key: "t", description: "Toggle theme", category: "actions" },
  { key: "d", description: "Toggle density", category: "actions" },
  { key: "/", description: "Search", category: "actions" },
  { key: "n / N", description: "Next / Previous search result", category: "actions" },
  { key: "Esc", description: "Go back / Cancel", category: "actions" },
  { key: "?", description: "Show keyboard shortcuts", category: "actions" },

  // Go-to
  { key: "gt / gh", description: "Go to Top stories", category: "goto" },
  { key: "gn", description: "Go to New stories", category: "goto" },
  { key: "ga", description: "Go to Ask HN", category: "goto" },
  { key: "gs", description: "Go to Show HN", category: "goto" },
  { key: "gj", description: "Go to Jobs", category: "goto" },
  { key: "gb", description: "Go to Bookmarks", category: "goto" },
  { key: "gu", description: "Go to User profile", category: "goto" },

  // Comment navigation
  { key: "j / k", description: "Next / Previous comment", category: "comments", context: "comments" },
  { key: "l", description: "Enter thread (first reply)", category: "comments", context: "comments" },
  { key: "h", description: "Exit to parent", category: "comments", context: "comments" },
  { key: "p", description: "Jump to parent comment", category: "comments", context: "comments" },
  { key: "[ / ]", description: "Previous / Next sibling", category: "comments", context: "comments" },
  { key: "{ / }", description: "Previous / Next root comment", category: "comments", context: "comments" },
  { key: "Enter / za", description: "Toggle collapse", category: "comments", context: "comments" },
  { key: "zc", description: "Collapse thread", category: "comments", context: "comments" },
  { key: "zo", description: "Expand thread", category: "comments", context: "comments" },
  { key: "zM", description: "Collapse all", category: "comments", context: "comments" },
  { key: "zR", description: "Expand all", category: "comments", context: "comments" },

  // Other
  { key: "Esc", description: "Cancel pending sequence", category: "other" },
];

// Helper to get shortcuts by category
export function getShortcutsByCategory(category: KeyboardShortcut["category"]): KeyboardShortcut[] {
  return keyboardShortcuts.filter((s) => s.category === category);
}

// Helper to get all shortcuts for a specific context
export function getShortcutsForContext(context: NavigationContext): KeyboardShortcut[] {
  return keyboardShortcuts.filter(
    (s) => !s.context || s.context === context || context === "global"
  );
}
