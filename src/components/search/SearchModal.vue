<script lang="ts">
export default { inheritAttrs: false };
</script>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { Search, X, Clock, Loader2 } from "lucide-vue-next";
import { useSearch } from "@/composables/useSearch";
import { useFocusTrap } from "@/composables/useFocusTrap";
import SearchResultItem from "./SearchResultItem.vue";
import type { SearchFilterType, SearchDateRange } from "@/lib/algolia-client";

const {
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
  closeSearch,
  openSearch,
  commitSearch,
  clearRecent,
} = useSearch();

const modalRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const resultsRef = ref<HTMLElement | null>(null);
const { activate, deactivate } = useFocusTrap(modalRef);

const filterTabs: { label: string; value: SearchFilterType }[] = [
  { label: "All", value: "all" },
  { label: "Stories", value: "story" },
  { label: "Comments", value: "comment" },
];

const dateOptions: { label: string; value: SearchDateRange }[] = [
  { label: "All time", value: "all" },
  { label: "24h", value: "24h" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

// Focus input when modal opens
watch(isOpen, async (open) => {
  document.body.style.overflow = open ? "hidden" : "";
  if (open) {
    await nextTick();
    inputRef.value?.focus();
    activate();
  } else {
    deactivate();
  }
});

// Keyboard navigation within results
const handleKeyDown = (event: KeyboardEvent) => {
  if (!isOpen.value) {
    return;
  }

  switch (event.key) {
    case "Escape":
      event.preventDefault();
      event.stopPropagation();
      closeSearch();
      break;
    case "ArrowDown":
      event.preventDefault();
      selectedIndex.value = Math.min(
        selectedIndex.value + 1,
        results.value.length - 1,
      );
      scrollSelectedIntoView();
      break;
    case "ArrowUp":
      event.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
      scrollSelectedIntoView();
      break;
    case "Enter":
      if (selectedIndex.value >= 0 && results.value[selectedIndex.value]) {
        event.preventDefault();
        navigateToResult(selectedIndex.value);
      } else if (results.value.length > 0) {
        event.preventDefault();
        navigateToResult(0);
      }
      break;
  }
};

const scrollSelectedIntoView = () => {
  nextTick(() => {
    const el = resultsRef.value?.querySelector(
      `[data-result-index="${selectedIndex.value}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  });
};

const navigateToResult = (index: number) => {
  const hit = results.value[index];
  if (!hit) {
    return;
  }

  commitSearch();

  const basePath = import.meta.env.BASE_URL || "/";
  const isComment = hit._tags.includes("comment");
  const url = isComment
    ? `${basePath}item/${hit.story_id || hit.objectID}`
    : `${basePath}item/${hit.objectID}`;

  closeSearch();
  window.location.href = url;
};

const useRecentSearch = (term: string) => {
  query.value = term;
};

const handleBackdropClick = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains("search-overlay")) {
    closeSearch();
  }
};

// Global keyboard handler for Cmd+K
const handleGlobalKeyDown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "k") {
    event.preventDefault();
    if (isOpen.value) {
      closeSearch();
    } else {
      openSearch();
    }
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleGlobalKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKeyDown);
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <Transition name="search-modal">
      <div
        v-if="isOpen"
        class="search-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Search Hacker News"
        @click="handleBackdropClick"
        @keydown="handleKeyDown"
      >
        <div ref="modalRef" class="search-modal">
          <!-- Search Input -->
          <div class="search-input-wrapper">
            <Search :size="18" class="search-icon" />
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              class="search-input"
              placeholder="Search stories and comments..."
              aria-label="Search"
              autocomplete="off"
              spellcheck="false"
            />
            <div class="search-input-actions">
              <Loader2 v-if="loading" :size="16" class="spin" />
              <kbd class="esc-hint">Esc</kbd>
              <button
                class="close-btn"
                aria-label="Close search"
                @click="closeSearch"
              >
                <X :size="18" />
              </button>
            </div>
          </div>

          <!-- Filters -->
          <div class="search-filters">
            <div class="filter-tabs">
              <button
                v-for="tab in filterTabs"
                :key="tab.value"
                class="filter-tab"
                :class="{ active: filterType === tab.value }"
                @click="filterType = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>
            <div class="date-filter">
              <select
                v-model="dateRange"
                class="date-select"
                aria-label="Date range"
              >
                <option
                  v-for="opt in dateOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Results -->
          <div ref="resultsRef" class="search-results" role="listbox">
            <!-- Recent searches (when query empty) -->
            <div
              v-if="!query.trim() && recentSearches.length > 0"
              class="recent-searches"
            >
              <div class="recent-header">
                <span class="recent-label">Recent searches</span>
                <button class="clear-recent" @click="clearRecent">Clear</button>
              </div>
              <button
                v-for="term in recentSearches"
                :key="term"
                class="recent-item"
                @click="useRecentSearch(term)"
              >
                <Clock :size="14" />
                <span>{{ term }}</span>
              </button>
            </div>

            <!-- Empty query state -->
            <div
              v-else-if="!query.trim() && recentSearches.length === 0"
              class="search-empty"
            >
              <Search :size="32" class="empty-icon" />
              <p>Search Hacker News stories and comments</p>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="search-error">
              <p>{{ error }}</p>
            </div>

            <!-- No results -->
            <div
              v-else-if="!loading && query.trim() && results.length === 0"
              class="search-empty"
            >
              <p>No results for "{{ query }}"</p>
            </div>

            <!-- Results list -->
            <template v-else>
              <div v-if="results.length > 0" class="results-count">
                Showing {{ results.length
                }}{{
                  totalHits > results.length
                    ? ` of ${totalHits.toLocaleString()}`
                    : ""
                }}
                results
              </div>
              <SearchResultItem
                v-for="(hit, index) in results"
                :key="hit.objectID"
                :hit="hit"
                :selected="index === selectedIndex"
                :data-result-index="index"
                @click="navigateToResult(index)"
              />
            </template>
          </div>

          <!-- Footer -->
          <div class="search-footer">
            <span class="footer-hint">
              <kbd>&uarr;</kbd><kbd>&darr;</kbd> navigate
              <kbd>Enter</kbd> select <kbd>Esc</kbd> close
            </span>
            <span class="powered-by">Powered by Algolia</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-search);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.search-modal {
  width: 100%;
  max-width: 600px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  margin: 0 var(--spacing-4);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--border-default);
}

.search-icon {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: var(--text-base);
  color: var(--text-primary);
  outline: none;
  font-family: var(--font-sans);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-input-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

.esc-hint {
  display: none;
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 6px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: 4px;
  color: var(--text-tertiary);
}

@media (min-width: 640px) {
  .esc-hint {
    display: inline-block;
  }
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.search-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: 1px solid var(--border-default);
  gap: var(--spacing-2);
}

.filter-tabs {
  display: flex;
  gap: var(--spacing-1);
}

.filter-tab {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-tab:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.filter-tab.active {
  color: var(--accent);
  border-color: var(--accent);
  background-color: var(--accent-muted);
}

.date-select {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  cursor: pointer;
  outline: none;
  font-family: var(--font-sans);
}

.date-select:focus {
  border-color: var(--accent);
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-2) 0;
}

.results-count {
  padding: var(--spacing-1) var(--spacing-4);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.recent-searches {
  padding: 0 var(--spacing-2);
}

.recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-1) var(--spacing-2);
}

.recent-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.clear-recent {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-1);
  transition: color var(--transition-fast);
}

.clear-recent:hover {
  color: var(--accent);
}

.recent-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 100%;
  padding: var(--spacing-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-sans);
  transition: all var(--transition-fast);
}

.recent-item:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  text-align: center;
  color: var(--text-tertiary);
}

.search-empty p {
  margin: var(--spacing-2) 0 0;
  font-size: var(--text-sm);
}

.empty-icon {
  opacity: 0.3;
}

.search-error {
  padding: var(--spacing-4);
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.search-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2) var(--spacing-4);
  border-top: 1px solid var(--border-default);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.footer-hint {
  display: none;
}

@media (min-width: 640px) {
  .footer-hint {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
  }
}

.footer-hint kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  font-family: var(--font-mono);
  font-size: 10px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: 3px;
}

.powered-by {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spin {
    animation: none !important;
  }
}

/* Transition */
.search-modal-enter-active,
.search-modal-leave-active {
  transition: opacity 150ms ease;
}

.search-modal-enter-active .search-modal,
.search-modal-leave-active .search-modal {
  transition: transform 150ms ease;
}

.search-modal-enter-from,
.search-modal-leave-to {
  opacity: 0;
}

.search-modal-enter-from .search-modal,
.search-modal-leave-to .search-modal {
  transform: scale(0.95) translateY(-10px);
}
</style>
