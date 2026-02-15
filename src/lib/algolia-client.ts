import ky from "ky";

const algoliaApi = ky.create({
  prefixUrl: "https://hn.algolia.com/api/v1",
  timeout: 10000,
});

export interface AlgoliaHighlight {
  value: string;
  matchLevel: "none" | "partial" | "full";
  matchedWords: string[];
}

export interface AlgoliaHit {
  objectID: string;
  title?: string;
  url?: string;
  author: string;
  points: number | null;
  num_comments: number | null;
  created_at: string;
  created_at_i: number;
  story_text?: string;
  comment_text?: string;
  story_title?: string;
  story_url?: string;
  story_id?: number;
  parent_id?: number;
  _tags: string[];
  _highlightResult?: {
    title?: AlgoliaHighlight;
    url?: AlgoliaHighlight;
    author?: AlgoliaHighlight;
    story_text?: AlgoliaHighlight;
    comment_text?: AlgoliaHighlight;
    story_title?: AlgoliaHighlight;
  };
}

export interface AlgoliaResponse {
  hits: AlgoliaHit[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
}

export type SearchFilterType = "all" | "story" | "comment";
export type SearchDateRange = "all" | "24h" | "week" | "month" | "year";

export interface SearchFilters {
  type: SearchFilterType;
  dateRange: SearchDateRange;
  sortByDate: boolean;
}

function getDateFilter(dateRange: SearchDateRange): string | null {
  if (dateRange === "all") {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const ranges: Record<string, number> = {
    "24h": 86400,
    week: 604800,
    month: 2592000,
    year: 31536000,
  };

  const seconds = ranges[dateRange];
  if (!seconds) {
    return null;
  }

  return `created_at_i>${now - seconds}`;
}

function getTagsFilter(type: SearchFilterType): string | null {
  if (type === "all") {
    return null;
  }
  return type;
}

export function searchHN(
  query: string,
  filters: SearchFilters = { type: "all", dateRange: "all", sortByDate: false },
  page: number = 0,
): Promise<AlgoliaResponse> {
  const endpoint = filters.sortByDate ? "search_by_date" : "search";

  const params: Record<string, string> = {
    query,
    page: String(page),
    hitsPerPage: "20",
  };

  const tags = getTagsFilter(filters.type);
  if (tags) {
    params.tags = tags;
  }

  const dateFilter = getDateFilter(filters.dateRange);
  if (dateFilter) {
    params.numericFilters = dateFilter;
  }

  return algoliaApi
    .get(endpoint, { searchParams: params })
    .json<AlgoliaResponse>();
}
