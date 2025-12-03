<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-vue-next";
import {
  searchHN,
  type AlgoliaHit,
  type SearchType,
  type DateRange,
  type SearchSort,
} from "@/lib/algolia-client";
import SearchResultItem from "./SearchResultItem.vue";

// Get initial values from URL
const getUrlParams = () => {
  if (typeof window === "undefined") return { q: "", type: "all", date: "all", sort: "relevance", page: 0 };
  const params = new URLSearchParams(window.location.search);
  return {
    q: params.get("q") || "",
    type: (params.get("type") || "all") as SearchType,
    date: (params.get("date") || "all") as DateRange,
    sort: (params.get("sort") || "relevance") as SearchSort,
    page: parseInt(params.get("page") || "0", 10),
  };
};

const initialParams = getUrlParams();

const query = ref(initialParams.q);
const searchType = ref<SearchType>(initialParams.type);
const dateRange = ref<DateRange>(initialParams.date);
const sortBy = ref<SearchSort>(initialParams.sort);
const currentPage = ref(initialParams.page);

const results = ref<AlgoliaHit[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const totalResults = ref(0);
const totalPages = ref(0);
const selectedIndex = ref(-1);

const inputRef = ref<HTMLInputElement | null>(null);

// Update URL when params change
const updateUrl = () => {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  if (query.value) params.set("q", query.value);
  if (searchType.value !== "all") params.set("type", searchType.value);
  if (dateRange.value !== "all") params.set("date", dateRange.value);
  if (sortBy.value !== "relevance") params.set("sort", sortBy.value);
  if (currentPage.value > 0) params.set("page", String(currentPage.value));

  const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
  window.history.replaceState({}, "", newUrl);
};

// Perform search
const performSearch = async (resetPage = false) => {
  if (!query.value.trim()) {
    results.value = [];
    totalResults.value = 0;
    totalPages.value = 0;
    return;
  }

  if (resetPage) {
    currentPage.value = 0;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await searchHN({
      query: query.value,
      type: searchType.value,
      dateRange: dateRange.value,
      sort: sortBy.value,
      page: currentPage.value,
      hitsPerPage: 30,
    });
    results.value = response.hits;
    totalResults.value = response.nbHits;
    totalPages.value = response.nbPages;
    selectedIndex.value = -1;
    updateUrl();
  } catch (err) {
    error.value = "Search failed. Please try again.";
    results.value = [];
  } finally {
    loading.value = false;
  }
};

// Handle form submit
const handleSubmit = (event: Event) => {
  event.preventDefault();
  performSearch(true);
};

// Watch filter changes
watch([searchType, dateRange, sortBy], () => {
  if (query.value.trim()) {
    performSearch(true);
  }
});

// Pagination
const goToPage = (page: number) => {
  currentPage.value = page;
  performSearch();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const prevPage = () => {
  if (currentPage.value > 0) {
    goToPage(currentPage.value - 1);
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    goToPage(currentPage.value + 1);
  }
};

// Initial search if query in URL
onMounted(() => {
  if (query.value.trim()) {
    performSearch();
  }
  inputRef.value?.focus();
});

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

// Sort options
const sortOptions: { value: SearchSort; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "date", label: "Date" },
];

const hasResults = computed(() => results.value.length > 0);
const showEmptyState = computed(
  () => query.value.trim() && !loading.value && !error.value && !hasResults.value
);
const showPagination = computed(() => totalPages.value > 1);
</script>

<template>
  <div class="search-page">
    <!-- Search Form -->
    <form class="search-form" @submit="handleSubmit">
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
        <button type="submit" class="search-btn" :disabled="loading">
          <Loader2 v-if="loading" :size="18" class="spin" />
          <span v-else>Search</span>
        </button>
      </div>
    </form>

    <!-- Filters -->
    <div class="search-filters">
      <div class="filter-group">
        <label class="filter-label">Type:</label>
        <select v-model="searchType" class="filter-select">
          <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Date:</label>
        <select v-model="dateRange" class="filter-select">
          <option v-for="opt in dateOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Sort:</label>
        <select v-model="sortBy" class="filter-select">
          <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Results Summary -->
    <div v-if="totalResults > 0" class="results-summary">
      <span>{{ totalResults.toLocaleString() }} results</span>
      <span v-if="showPagination">
        &middot; Page {{ currentPage + 1 }} of {{ totalPages }}
      </span>
    </div>

    <!-- Results -->
    <div class="search-results">
      <!-- Error state -->
      <div v-if="error" class="search-message error">
        {{ error }}
      </div>

      <!-- Empty state -->
      <div v-else-if="showEmptyState" class="search-message">
        <p>No results found for "{{ query }}"</p>
        <p class="hint">Try adjusting your filters or search terms</p>
      </div>

      <!-- Loading state -->
      <div v-else-if="loading && !hasResults" class="search-message">
        <Loader2 :size="32" class="spin" />
        <p>Searching...</p>
      </div>

      <!-- Results list -->
      <div v-else-if="hasResults" class="results-list">
        <SearchResultItem
          v-for="(hit, index) in results"
          :key="hit.objectID"
          :hit="hit"
          :selected="index === selectedIndex"
        />
      </div>

      <!-- Initial state -->
      <div v-else class="search-message">
        <p>Search stories, comments, Ask HN, Show HN, and more</p>
        <p class="hint">Powered by Algolia</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination" class="pagination">
      <button
        class="page-btn"
        :disabled="currentPage === 0"
        @click="prevPage"
      >
        <ChevronLeft :size="18" />
        Previous
      </button>
      <span class="page-info">
        Page {{ currentPage + 1 }} of {{ totalPages }}
      </span>
      <button
        class="page-btn"
        :disabled="currentPage >= totalPages - 1"
        @click="nextPage"
      >
        Next
        <ChevronRight :size="18" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.search-form {
  display: flex;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast);
}

.search-input-wrapper:focus-within {
  border-color: var(--accent);
}

.search-icon {
  flex-shrink: 0;
  color: var(--text-tertiary);
}

.search-input {
  flex: 1;
  padding: var(--spacing-1) 0;
  font-size: var(--text-lg);
  color: var(--text-primary);
  background: none;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-sm);
  font-weight: 500;
  color: white;
  background-color: var(--accent);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.search-btn:hover:not(:disabled) {
  background-color: var(--accent-hover);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.search-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.filter-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.filter-select {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--text-sm);
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  cursor: pointer;
  outline: none;
}

.filter-select:focus {
  border-color: var(--accent);
}

.results-summary {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.search-results {
  min-height: 200px;
}

.search-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12) var(--spacing-4);
  text-align: center;
  color: var(--text-secondary);
}

.search-message.error {
  color: #ef4444;
}

.search-message p {
  margin: var(--spacing-2) 0;
}

.search-message .hint {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.results-list > :deep(.search-result) {
  border-radius: 0;
}

.results-list > :deep(.search-result:not(:last-child)) {
  border-bottom: 1px solid var(--border-subtle);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4) 0;
}

.page-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-btn:hover:not(:disabled) {
  color: var(--text-primary);
  border-color: var(--text-tertiary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

@media (max-width: 640px) {
  .search-filters {
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .filter-group {
    width: 100%;
    justify-content: space-between;
  }

  .filter-select {
    flex: 1;
    max-width: 150px;
  }

  .pagination {
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .page-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
