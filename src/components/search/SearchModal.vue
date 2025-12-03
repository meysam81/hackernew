<script setup lang="ts">
import { ref, watch, computed, nextTick } from "vue";
import { Search, X, Loader2, ArrowRight } from "lucide-vue-next";
import { useModal } from "@/composables/useModal";
import {
  searchHN,
  type AlgoliaHit,
  type SearchType,
  type DateRange,
} from "@/lib/algolia-client";
import SearchResultItem from "./SearchResultItem.vue";

const { searchModalVisible, hideSearchModal } = useModal();

const query = ref("");
const results = ref<AlgoliaHit[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedIndex = ref(0);
const totalResults = ref(0);
const searchType = ref<SearchType>("all");
const dateRange = ref<DateRange>("all");

const inputRef = ref<HTMLInputElement | null>(null);
const resultsRef = ref<HTMLElement | null>(null);

const basePath = import.meta.env.BASE_URL || "/";

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const performSearch = async () => {
  if (!query.value.trim()) {
    results.value = [];
    totalResults.value = 0;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await searchHN({
      query: query.value,
      type: searchType.value,
      dateRange: dateRange.value,
      hitsPerPage: 10,
    });
    results.value = response.hits;
    totalResults.value = response.nbHits;
    selectedIndex.value = 0;
  } catch (err) {
    error.value = "Search failed. Please try again.";
    results.value = [];
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(performSearch, 300);
};

// Watch query changes
watch(query, debouncedSearch);

// Watch filter changes
watch([searchType, dateRange], () => {
  if (query.value.trim()) {
    performSearch();
  }
});

// Focus input when modal opens
watch(searchModalVisible, async (visible) => {
  if (visible) {
    await nextTick();
    inputRef.value?.focus();
  } else {
    // Reset state when closing
    query.value = "";
    results.value = [];
    error.value = null;
    selectedIndex.value = 0;
    searchType.value = "all";
    dateRange.value = "all";
  }
});

// Keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  if (!searchModalVisible.value) return;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1);
      scrollSelectedIntoView();
      break;
    case "ArrowUp":
      event.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
      scrollSelectedIntoView();
      break;
    case "Enter":
      event.preventDefault();
      if (results.value[selectedIndex.value]) {
        openResult(results.value[selectedIndex.value]);
      } else if (query.value.trim()) {
        goToFullSearch();
      }
      break;
    case "j":
      if (event.ctrlKey) {
        event.preventDefault();
        selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1);
        scrollSelectedIntoView();
      }
      break;
    case "k":
      if (event.ctrlKey) {
        event.preventDefault();
        selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
        scrollSelectedIntoView();
      }
      break;
  }
};

const scrollSelectedIntoView = () => {
  nextTick(() => {
    const selectedEl = resultsRef.value?.querySelector(`[data-index="${selectedIndex.value}"]`);
    selectedEl?.scrollIntoView({ block: "nearest" });
  });
};

const openResult = (hit: AlgoliaHit) => {
  const storyId = hit.story_id || parseInt(hit.objectID, 10);
  window.location.href = `${basePath}item/${storyId}`;
  hideSearchModal();
};

const goToFullSearch = () => {
  const searchParams = new URLSearchParams();
  searchParams.set("q", query.value);
  if (searchType.value !== "all") {
    searchParams.set("type", searchType.value);
  }
  if (dateRange.value !== "all") {
    searchParams.set("date", dateRange.value);
  }
  window.location.href = `${basePath}search?${searchParams.toString()}`;
  hideSearchModal();
};

// Handle backdrop click
const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    hideSearchModal();
  }
};

// Type filter options
const typeOptions: { value: SearchType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "story", label: "Stories" },
  { value: "comment", label: "Comments" },
  { value: "ask_hn", label: "Ask HN" },
  { value: "show_hn", label: "Show HN" },
  { value: "job", label: "Jobs" },
];

// Date filter options
const dateOptions: { value: DateRange; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "day", label: "Past 24h" },
  { value: "week", label: "Past week" },
  { value: "month", label: "Past month" },
  { value: "year", label: "Past year" },
];

const hasResults = computed(() => results.value.length > 0);
const showEmptyState = computed(
  () => query.value.trim() && !loading.value && !error.value && !hasResults.value
);
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="searchModalVisible"
        class="search-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-title"
        @click="handleBackdropClick"
        @keydown="handleKeyDown"
      >
        <div class="search-modal">
          <!-- Search Input -->
          <div class="search-header">
            <div class="search-input-wrapper">
              <Search :size="20" class="search-icon" />
              <input
                ref="inputRef"
                v-model="query"
                type="text"
                class="search-input"
                placeholder="Search Hacker News..."
                aria-label="Search"
              />
              <div v-if="loading" class="search-loading">
                <Loader2 :size="18" class="spin" />
              </div>
              <button
                v-else-if="query"
                class="clear-btn"
                aria-label="Clear search"
                @click="query = ''"
              >
                <X :size="18" />
              </button>
            </div>
            <button class="close-btn" aria-label="Close" @click="hideSearchModal">
              <X :size="20" />
            </button>
          </div>

          <!-- Filters -->
          <div class="search-filters">
            <div class="filter-group">
              <select v-model="searchType" class="filter-select" aria-label="Type filter">
                <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
              <select v-model="dateRange" class="filter-select" aria-label="Date filter">
                <option v-for="opt in dateOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <span v-if="totalResults > 0" class="results-count">
              {{ totalResults.toLocaleString() }} results
            </span>
          </div>

          <!-- Results -->
          <div ref="resultsRef" class="search-results" role="listbox">
            <!-- Error state -->
            <div v-if="error" class="search-message error">
              {{ error }}
            </div>

            <!-- Empty state -->
            <div v-else-if="showEmptyState" class="search-message">
              No results found for "{{ query }}"
            </div>

            <!-- Results list -->
            <template v-else-if="hasResults">
              <SearchResultItem
                v-for="(hit, index) in results"
                :key="hit.objectID"
                :hit="hit"
                :selected="index === selectedIndex"
                :data-index="index"
                @select="openResult(hit)"
              />
            </template>

            <!-- Initial state -->
            <div v-else-if="!query.trim()" class="search-message hint">
              <p>Search stories, comments, Ask HN, Show HN, and more</p>
              <div class="keyboard-hint">
                <kbd>↑</kbd><kbd>↓</kbd> to navigate
                <kbd>Enter</kbd> to open
                <kbd>Esc</kbd> to close
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div v-if="query.trim()" class="search-footer">
            <button class="view-all-btn" @click="goToFullSearch">
              View all results
              <ArrowRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: var(--spacing-16) var(--spacing-4) var(--spacing-4);
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.search-modal {
  width: 100%;
  max-width: 600px;
  max-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.search-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--border-default);
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.search-icon {
  flex-shrink: 0;
  color: var(--text-tertiary);
}

.search-input {
  flex: 1;
  padding: var(--spacing-2) 0;
  font-size: var(--text-lg);
  color: var(--text-primary);
  background: none;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-loading {
  display: flex;
  align-items: center;
  color: var(--text-tertiary);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.clear-btn,
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-1);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.clear-btn:hover,
.close-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.search-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-4);
  background-color: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-default);
}

.filter-group {
  display: flex;
  gap: var(--spacing-2);
}

.filter-select {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  cursor: pointer;
  outline: none;
}

.filter-select:focus {
  border-color: var(--accent);
}

.results-count {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-2) 0;
}

.search-message {
  padding: var(--spacing-8) var(--spacing-4);
  text-align: center;
  color: var(--text-secondary);
}

.search-message.error {
  color: #ef4444;
}

.search-message.hint p {
  margin: 0 0 var(--spacing-4);
}

.keyboard-hint {
  display: flex;
  justify-content: center;
  gap: var(--spacing-4);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.keyboard-hint kbd {
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: 4px;
}

.search-footer {
  padding: var(--spacing-3) var(--spacing-4);
  border-top: 1px solid var(--border-default);
}

.view-all-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  width: 100%;
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--accent);
  background: none;
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.view-all-btn:hover {
  background-color: var(--accent-muted);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-fast);
}

.modal-enter-active .search-modal,
.modal-leave-active .search-modal {
  transition: transform var(--transition-fast);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .search-modal,
.modal-leave-to .search-modal {
  transform: translateY(-20px);
}

@media (max-width: 640px) {
  .search-backdrop {
    padding: var(--spacing-4);
    align-items: flex-start;
  }

  .search-modal {
    max-height: calc(100vh - 32px);
  }

  .search-filters {
    flex-direction: column;
    align-items: flex-start;
  }

  .keyboard-hint {
    display: none;
  }
}
</style>
