import ky from "ky";
import log from "@/utils/logger";

// HN API Types
export interface HNStory {
  id: number;
  title: string;
  url?: string;
  text?: string;
  by: string;
  time: number;
  score: number;
  descendants: number;
  kids?: number[];
  type: "story" | "job" | "poll" | "pollopt";
  deleted?: boolean;
  dead?: boolean;
}

export interface HNComment {
  id: number;
  by: string;
  text: string;
  time: number;
  kids?: number[];
  parent: number;
  type: "comment";
  deleted?: boolean;
  dead?: boolean;
}

export interface HNUser {
  id: string;
  created: number;
  karma: number;
  about?: string;
  submitted?: number[];
}

export type HNItem = HNStory | HNComment;

export type FeedType = "top" | "new" | "best" | "ask" | "show" | "job";

// Configure Ky instance for HN API
export const hnApi = ky.create({
  prefixUrl: "https://hacker-news.firebaseio.com/v0",
  timeout: 15000,
  retry: {
    limit: 2,
    methods: ["get"],
    statusCodes: [408, 429, 500, 502, 503, 504],
  },
});

// Cache implementation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) {
    return null;
  }

  const isStale = Date.now() - entry.timestamp > CACHE_TTL;
  if (isStale) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// API Functions
export async function getStoryIds(
  type: FeedType,
  forceFresh?: boolean,
): Promise<number[]> {
  const endpoint = `${type}stories.json`;
  const cacheKey = `ids:${type}`;

  if (!forceFresh) {
    const cached = getCached<number[]>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const ids = await hnApi.get(endpoint).json<number[]>();

  if (!forceFresh) {
    setCache(cacheKey, ids);
  }

  return ids;
}

export async function getItem<T extends HNItem>(id: number): Promise<T | null> {
  const cacheKey = `item:${id}`;

  const cached = getCached<T>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const item = await hnApi.get(`item/${id}.json`).json<T | null>();
    if (item) {
      setCache(cacheKey, item);
    }
    return item;
  } catch (error) {
    log.error(`Failed to fetch item ${id}:`, error);
    return null;
  }
}

export function getStory(id: number): Promise<HNStory | null> {
  return getItem<HNStory>(id);
}

export function getComment(id: number): Promise<HNComment | null> {
  return getItem<HNComment>(id);
}

export async function getUser(username: string): Promise<HNUser | null> {
  const cacheKey = `user:${username}`;

  const cached = getCached<HNUser>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const user = await hnApi.get(`user/${username}.json`).json<HNUser | null>();
    if (user) {
      setCache(cacheKey, user);
    }
    return user;
  } catch (error) {
    log.error(`Failed to fetch user ${username}:`, error);
    return null;
  }
}

export async function getStories(
  type: FeedType,
  limit: number = 30,
  offset: number = 0,
): Promise<HNStory[]> {
  const ids = await getStoryIds(type);
  const slicedIds = ids.slice(offset, offset + limit);

  const stories = await Promise.all(slicedIds.map((id) => getStory(id)));

  return stories.filter(
    (story): story is HNStory =>
      story !== null && !story.deleted && !story.dead,
  );
}

export async function getCommentTree(
  commentIds: number[],
  depth: number = 0,
  maxDepth: number = 10,
): Promise<(HNComment & { replies: HNComment[] })[]> {
  if (depth >= maxDepth || commentIds.length === 0) {
    return [];
  }

  const comments = await Promise.all(commentIds.map((id) => getComment(id)));

  const validComments = comments.filter(
    (c): c is HNComment => c !== null && !c.deleted && !c.dead,
  );

  const commentsWithReplies = await Promise.all(
    validComments.map(async (comment) => {
      const replies = comment.kids
        ? await getCommentTree(comment.kids, depth + 1, maxDepth)
        : [];
      return { ...comment, replies };
    }),
  );

  return commentsWithReplies;
}

// Progressive comment loading types
export interface LazyComment extends HNComment {
  replies: LazyComment[];
  replyIds: number[];
  repliesLoaded: boolean;
  hasMoreReplies: boolean;
}

// Batch size constants for progressive loading
export const COMMENT_BATCH_SIZE = 20;
export const REPLY_BATCH_SIZE = 10;

/**
 * Fetch a batch of top-level comments with their immediate first-level replies
 * This enables progressive loading - showing comments as they load
 */
export async function getCommentBatch(
  commentIds: number[],
  offset: number = 0,
  limit: number = COMMENT_BATCH_SIZE,
): Promise<{ comments: LazyComment[]; hasMore: boolean; total: number }> {
  const total = commentIds.length;
  const slicedIds = commentIds.slice(offset, offset + limit);

  if (slicedIds.length === 0) {
    return { comments: [], hasMore: false, total };
  }

  // Fetch comments in parallel
  const rawComments = await Promise.all(slicedIds.map((id) => getComment(id)));

  const validComments = rawComments.filter(
    (c): c is HNComment => c !== null && !c.deleted && !c.dead,
  );

  // For each comment, fetch only the first few replies (shallow)
  const commentsWithShallowReplies = await Promise.all(
    validComments.map(async (comment) => {
      const replyIds = comment.kids || [];
      const initialReplyIds = replyIds.slice(0, REPLY_BATCH_SIZE);

      let replies: LazyComment[] = [];
      if (initialReplyIds.length > 0) {
        const rawReplies = await Promise.all(
          initialReplyIds.map((id) => getComment(id)),
        );
        replies = rawReplies
          .filter((r): r is HNComment => r !== null && !r.deleted && !r.dead)
          .map((reply) => ({
            ...reply,
            replies: [],
            replyIds: reply.kids || [],
            repliesLoaded: false,
            hasMoreReplies: (reply.kids || []).length > 0,
          }));
      }

      return {
        ...comment,
        replies,
        replyIds,
        repliesLoaded: replyIds.length <= REPLY_BATCH_SIZE,
        hasMoreReplies: replyIds.length > REPLY_BATCH_SIZE,
      } as LazyComment;
    }),
  );

  return {
    comments: commentsWithShallowReplies,
    hasMore: offset + limit < total,
    total,
  };
}

/**
 * Fetch more replies for a specific comment
 * Used for lazy-loading nested replies when user expands a comment
 */
export async function getMoreReplies(
  replyIds: number[],
  offset: number = 0,
  limit: number = REPLY_BATCH_SIZE,
): Promise<{ replies: LazyComment[]; hasMore: boolean }> {
  const slicedIds = replyIds.slice(offset, offset + limit);

  if (slicedIds.length === 0) {
    return { replies: [], hasMore: false };
  }

  const rawReplies = await Promise.all(slicedIds.map((id) => getComment(id)));

  const replies = rawReplies
    .filter((r): r is HNComment => r !== null && !r.deleted && !r.dead)
    .map((reply) => ({
      ...reply,
      replies: [],
      replyIds: reply.kids || [],
      repliesLoaded: false,
      hasMoreReplies: (reply.kids || []).length > 0,
    }));

  return {
    replies,
    hasMore: offset + limit < replyIds.length,
  };
}

/**
 * Fetch a single comment with metadata for lazy loading
 */
export async function getLazyComment(id: number): Promise<LazyComment | null> {
  const comment = await getComment(id);
  if (!comment || comment.deleted || comment.dead) {
    return null;
  }

  return {
    ...comment,
    replies: [],
    replyIds: comment.kids || [],
    repliesLoaded: false,
    hasMoreReplies: (comment.kids || []).length > 0,
  };
}

// Utility functions
export function getDomain(url?: string): string {
  if (!url) {
    return "";
  }
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function getHNUrl(itemId: number): string {
  return `https://news.ycombinator.com/item?id=${itemId}`;
}

export function getUserUrl(username: string): string {
  return `https://news.ycombinator.com/user?id=${username}`;
}
