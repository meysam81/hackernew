import { type Ref, onUnmounted } from "vue";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(container: Ref<HTMLElement | null>) {
  let previouslyFocused: HTMLElement | null = null;
  let active = false;

  const getFocusableElements = (): HTMLElement[] => {
    if (!container.value) {
      return [];
    }
    return Array.from(
      container.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((el) => el.offsetParent !== null);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab" || !active) {
      return;
    }

    const focusable = getFocusableElements();
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const activate = () => {
    if (active) {
      return;
    }
    active = true;
    previouslyFocused = document.activeElement as HTMLElement;
    document.addEventListener("keydown", handleKeyDown);

    // Focus first focusable element
    requestAnimationFrame(() => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    });
  };

  const deactivate = () => {
    if (!active) {
      return;
    }
    active = false;
    document.removeEventListener("keydown", handleKeyDown);

    if (previouslyFocused && previouslyFocused.focus) {
      previouslyFocused.focus();
    }
    previouslyFocused = null;
  };

  onUnmounted(() => {
    deactivate();
  });

  return { activate, deactivate };
}
