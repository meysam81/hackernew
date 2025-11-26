import { ref, watch, onMounted } from 'vue';
import { getLocalStorage, setLocalStorage } from '@/lib/utils';

export type Density = 'comfortable' | 'compact';

const STORAGE_KEY = 'hackernew-density';

// Shared state across components
const density = ref<Density>('comfortable');

export function useDensity() {
  const setDensity = (newDensity: Density) => {
    density.value = newDensity;
    setLocalStorage(STORAGE_KEY, newDensity);
    applyDensity();
  };

  const toggleDensity = () => {
    const newDensity = density.value === 'comfortable' ? 'compact' : 'comfortable';
    setDensity(newDensity);
  };

  const applyDensity = () => {
    if (typeof document === 'undefined') return;

    document.documentElement.classList.remove('density-comfortable', 'density-compact');
    document.documentElement.classList.add(`density-${density.value}`);
  };

  const initDensity = () => {
    if (typeof window === 'undefined') return;

    const stored = getLocalStorage<Density>(STORAGE_KEY, 'comfortable');
    density.value = stored;
    applyDensity();
  };

  onMounted(() => {
    initDensity();
  });

  watch(density, () => {
    applyDensity();
  });

  return {
    density,
    setDensity,
    toggleDensity,
  };
}
