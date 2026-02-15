import { ref, watch, nextTick } from "vue";
import {
  searchHN,
  type AlgoliaHit,
  type SearchFilterType,
  type SearchDateRange,
} from "@/lib/algolia-client";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

const RECENT_SEARCHES_KEY = "hackernew-recent-searches";
const MAX_RECENT = 10;

// Module-level shared state
const isOpen = ref(false);
const query = ref("");
const results = ref<AlgoliaHit[]>([]);
const totalHits = ref(0);
const loading = ref(false);
const error = ref<string | null>(null);
const filterType = ref<SearchFilterType>("all");
const dateRange = ref<SearchDateRange>("all");
const recentSearches = ref<string[]>(
  getLocalStorage<string[]>(RECENT_SEARCHES_KEY, []),
);
const selectedIndex = ref(-1);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let watchersRegistered = false;
let requestId = 0;

export function useSearch() {
  const openSearch = () => {
    isOpen.value = true;
    query.value = "";
    results.value = [];
    error.value = null;
    selectedIndex.value = -1;
  };

  const closeSearch = () => {
    isOpen.value = false;
    // Reset state on next tick to avoid Vue patching children of a removed Teleport container
    // (causes "Cannot read properties of null (reading 'insertBefore')")
    nextTick(() => {
      query.value = "";
      results.value = [];
      error.value = null;
      selectedIndex.value = -1;
    });
  };

  const addRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      return;
    }

    const filtered = recentSearches.value.filter((s) => s !== trimmed);
    filtered.unshift(trimmed);
    recentSearches.value = filtered.slice(0, MAX_RECENT);
    setLocalStorage(RECENT_SEARCHES_KEY, recentSearches.value);
  };

  const clearRecent = () => {
    recentSearches.value = [];
    setLocalStorage(RECENT_SEARCHES_KEY, []);
  };

  const performSearch = async () => {
    const q = query.value.trim();
    if (!q) {
      results.value = [];
      totalHits.value = 0;
      error.value = null;
      return;
    }

    const currentRequest = ++requestId;

    try {
      loading.value = true;
      error.value = null;

      const response = await searchHN(q, {
        type: filterType.value,
        dateRange: dateRange.value,
        sortByDate: false,
      });

      if (currentRequest !== requestId) {
        return;
      }

      results.value = response.hits;
      totalHits.value = response.nbHits;
      selectedIndex.value = -1;
    } catch {
      if (currentRequest !== requestId) {
        return;
      }
      error.value = "Search failed. Please try again.";
      results.value = [];
      totalHits.value = 0;
    } finally {
      if (currentRequest === requestId) {
        loading.value = false;
      }
    }
  };

  const commitSearch = () => {
    addRecentSearch(query.value);
  };

  const debouncedSearch = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(performSearch, 300);
  };

  if (!watchersRegistered) {
    watchersRegistered = true;

    // Watch query for debounced search
    watch(query, () => {
      if (query.value.trim()) {
        debouncedSearch();
      } else {
        results.value = [];
        totalHits.value = 0;
        error.value = null;
      }
    });

    // Re-search when filters change (if query exists)
    watch([filterType, dateRange], () => {
      if (query.value.trim()) {
        performSearch();
      }
    });
  }

  return {
    isOpen,
    query,
    results,
    totalHits,
    loading,
    error,
    filterType,
    dateRange,
    recentSearches,
    selectedIndex,
    openSearch,
    closeSearch,
    performSearch,
    commitSearch,
    clearRecent,
  };
}
