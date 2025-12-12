import { ref, onMounted, onUnmounted } from "vue";

// Shared modal state - module level for cross-component access
const keyboardHelpVisible = ref(false);
const searchModalVisible = ref(false);

export function useModal() {
  // Keyboard Help Modal
  const showKeyboardHelp = () => {
    keyboardHelpVisible.value = true;
  };

  const hideKeyboardHelp = () => {
    keyboardHelpVisible.value = false;
  };

  const toggleKeyboardHelp = () => {
    keyboardHelpVisible.value = !keyboardHelpVisible.value;
  };

  // Search Modal
  const showSearchModal = () => {
    searchModalVisible.value = true;
  };

  const hideSearchModal = () => {
    searchModalVisible.value = false;
  };

  const toggleSearchModal = () => {
    searchModalVisible.value = !searchModalVisible.value;
  };

  // Close all modals
  const closeAllModals = () => {
    keyboardHelpVisible.value = false;
    searchModalVisible.value = false;
  };

  // Handle escape key to close modals
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      if (searchModalVisible.value) {
        hideSearchModal();
        event.preventDefault();
        event.stopPropagation();
      } else if (keyboardHelpVisible.value) {
        hideKeyboardHelp();
        event.preventDefault();
        event.stopPropagation();
      }
    }
  };

  // Handle Cmd+K / Ctrl+K to open search
  const handleSearchShortcut = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "k") {
      event.preventDefault();
      toggleSearchModal();
    }
    // Also handle "/" key when not in an input
    if (event.key === "/" && !searchModalVisible.value) {
      const target = event.target as HTMLElement;
      if (
        target.tagName !== "INPUT" &&
        target.tagName !== "TEXTAREA" &&
        !target.isContentEditable
      ) {
        event.preventDefault();
        showSearchModal();
      }
    }
  };

  onMounted(() => {
    window.addEventListener("keydown", handleEscape, true);
    window.addEventListener("keydown", handleSearchShortcut);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleEscape, true);
    window.removeEventListener("keydown", handleSearchShortcut);
  });

  return {
    // Keyboard Help
    keyboardHelpVisible,
    showKeyboardHelp,
    hideKeyboardHelp,
    toggleKeyboardHelp,
    // Search Modal
    searchModalVisible,
    showSearchModal,
    hideSearchModal,
    toggleSearchModal,
    // Utilities
    closeAllModals,
  };
}
