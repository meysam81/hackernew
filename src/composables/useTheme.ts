import { ref, watch, onMounted } from 'vue';
import { getLocalStorage, setLocalStorage } from '@/lib/utils';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'hackernew-theme';

// Shared state across components
const theme = ref<Theme>('system');
const resolvedTheme = ref<'light' | 'dark'>('light');

export function useTheme() {
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    setLocalStorage(STORAGE_KEY, newTheme);
    applyTheme();
  };

  const toggleTheme = () => {
    const newTheme = resolvedTheme.value === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const applyTheme = () => {
    if (typeof window === 'undefined') return;

    let effectiveTheme: 'light' | 'dark';

    if (theme.value === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      effectiveTheme = theme.value;
    }

    resolvedTheme.value = effectiveTheme;

    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const initTheme = () => {
    if (typeof window === 'undefined') return;

    // Load from storage
    const stored = getLocalStorage<Theme>(STORAGE_KEY, 'system');
    theme.value = stored;

    // Apply immediately
    applyTheme();

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme();
      }
    });
  };

  onMounted(() => {
    initTheme();
  });

  // Watch for theme changes
  watch(theme, () => {
    applyTheme();
  });

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}
