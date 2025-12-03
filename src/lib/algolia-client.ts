import ky from "ky";
import log from "@/utils/logger";

// Algolia HN Search API Types
export interface AlgoliaHit {
  objectID: string;
  title: string | null;
  url: string | null;
  author: string;
  points: number | null;
  story_text: string | null;
  comment_text: string | null;
  num_comments: number | null;
  story_id: number | null;
  story_title: string | null;
  story_url: string | null;
  parent_id: number | null;
  created_at: string;
  created_at_i: number;
  _tags: string[];
  _highlightResult?: {
    title?: { value: string; matchLevel: string };
    url?: { value: string; matchLevel: string };
    author?: { value: string; matchLevel: string };
    story_text?: { value: string; matchLevel: string };
    comment_text?: { value: string; matchLevel: string };
  };
}

export interface AlgoliaSearchResponse {
  hits: AlgoliaHit[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  exhaustiveNbHits: boolean;
  exhaustiveTypo: boolean;
  query: string;
  params: string;
  processingTimeMS: number;
}

export type SearchType = "all" | "story" | "comment" | "ask_hn" | "show_hn" | "job";
export type SearchSort = "relevance" | "date";
export type DateRange = "all" | "day" | "week" | "month" | "year";

export interface SearchOptions {
  query: string;
  type?: SearchType;
  sort?: SearchSort;
  dateRange?: DateRange;
  page?: number;
  hitsPerPage?: number;
}

// Configure Ky instance for Algolia HN Search API
const algoliaApi = ky.create({
  prefixUrl: "https://hn.algolia.com/api/v1",
  timeout: 10000,
  retry: {
    limit: 2,
    methods: ["get"],
    statusCodes: [408, 429, 500, 502, 503, 504],
  },
});

// Get tag filter based on search type
function getTagFilter(type: SearchType): string {
  switch (type) {
    case "story":
      return "story";
    case "comment":
      return "comment";
    case "ask_hn":
      return "ask_hn";
    case "show_hn":
      return "show_hn";
    case "job":
      return "job";
    default:
      return "";
  }
}

// Get numeric filter for date range
function getDateFilter(dateRange: DateRange): string {
  if (dateRange === "all") return "";

  const now = Math.floor(Date.now() / 1000);
  let startTime: number;

  switch (dateRange) {
    case "day":
      startTime = now - 24 * 60 * 60;
      break;
    case "week":
      startTime = now - 7 * 24 * 60 * 60;
      break;
    case "month":
      startTime = now - 30 * 24 * 60 * 60;
      break;
    case "year":
      startTime = now - 365 * 24 * 60 * 60;
      break;
    default:
      return "";
  }

  return `created_at_i>${startTime}`;
}

// Search HN via Algolia
export async function searchHN(options: SearchOptions): Promise<AlgoliaSearchResponse> {
  const {
    query,
    type = "all",
    sort = "relevance",
    dateRange = "all",
    page = 0,
    hitsPerPage = 20,
  } = options;

  // Build search parameters
  const params = new URLSearchParams();
  params.set("query", query);
  params.set("page", String(page));
  params.set("hitsPerPage", String(hitsPerPage));

  // Add tag filter
  const tagFilter = getTagFilter(type);
  if (tagFilter) {
    params.set("tags", tagFilter);
  }

  // Add date filter
  const dateFilter = getDateFilter(dateRange);
  if (dateFilter) {
    params.set("numericFilters", dateFilter);
  }

  // Choose endpoint based on sort
  const endpoint = sort === "date" ? "search_by_date" : "search";

  try {
    const response = await algoliaApi
      .get(endpoint, { searchParams: params })
      .json<AlgoliaSearchResponse>();
    return response;
  } catch (error) {
    log.error("Failed to search HN:", error);
    throw error;
  }
}

// Get story ID from Algolia hit
export function getStoryId(hit: AlgoliaHit): number {
  // For comments, use story_id; for stories, parse objectID
  if (hit.story_id) {
    return hit.story_id;
  }
  return parseInt(hit.objectID, 10);
}

// Get item ID from Algolia hit (the actual item, not parent story)
export function getItemId(hit: AlgoliaHit): number {
  return parseInt(hit.objectID, 10);
}

// Check if hit is a story
export function isStory(hit: AlgoliaHit): boolean {
  return hit._tags.includes("story") || hit._tags.includes("ask_hn") || hit._tags.includes("show_hn") || hit._tags.includes("job");
}

// Check if hit is a comment
export function isComment(hit: AlgoliaHit): boolean {
  return hit._tags.includes("comment");
}

// Get display title for a hit
export function getHitTitle(hit: AlgoliaHit): string {
  if (hit.title) {
    return hit.title;
  }
  if (hit.story_title) {
    return hit.story_title;
  }
  return "Untitled";
}

// Get URL for a hit
export function getHitUrl(hit: AlgoliaHit): string | null {
  if (hit.url) {
    return hit.url;
  }
  if (hit.story_url) {
    return hit.story_url;
  }
  return null;
}

// Get domain from URL
export function getDomain(url: string | null): string {
  if (!url) return "";
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Format relative time
export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
}
