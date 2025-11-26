import { ref, onMounted, onUnmounted } from 'vue';

interface KeyboardOptions {
  onNavigate?: (direction: 'up' | 'down') => void;
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
    if (!isEnabled.value) return;

    // Don't capture when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case 'j':
        event.preventDefault();
        onNavigate?.('down');
        break;
      case 'k':
        event.preventDefault();
        onNavigate?.('up');
        break;
      case 'o':
      case 'enter':
        if (!event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          onOpen?.();
        }
        break;
      case 'c':
        event.preventDefault();
        onOpenComments?.();
        break;
      case 'b':
        event.preventDefault();
        onBookmark?.();
        break;
      case 'escape':
      case 'backspace':
        if (event.key === 'backspace' && !event.metaKey) break;
        event.preventDefault();
        onBack?.();
        break;
      case '?':
        // Show keyboard shortcuts help (could emit event)
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
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  return {
    isEnabled,
    enable,
    disable,
  };
}

// Keyboard shortcuts help
export const keyboardShortcuts = [
  { key: 'j', description: 'Next story' },
  { key: 'k', description: 'Previous story' },
  { key: 'o', description: 'Open story link' },
  { key: 'c', description: 'Open comments' },
  { key: 'b', description: 'Toggle bookmark' },
  { key: 'Esc', description: 'Go back' },
  { key: '?', description: 'Show shortcuts' },
];
