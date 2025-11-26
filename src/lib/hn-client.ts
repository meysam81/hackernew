import ky from 'ky';

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
  type: 'story' | 'job' | 'poll' | 'pollopt';
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
  type: 'comment';
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

export type FeedType = 'top' | 'new' | 'best' | 'ask' | 'show' | 'job';

// Configure Ky instance for HN API
export const hnApi = ky.create({
  prefixUrl: 'https://hacker-news.firebaseio.com/v0',
  timeout: 15000,
  retry: {
    limit: 2,
    methods: ['get'],
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
  if (!entry) return null;

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
export async function getStoryIds(type: FeedType): Promise<number[]> {
  const endpoint = `${type}stories.json`;
  const cacheKey = `ids:${type}`;

  const cached = getCached<number[]>(cacheKey);
  if (cached) return cached;

  const ids = await hnApi.get(endpoint).json<number[]>();
  setCache(cacheKey, ids);

  return ids;
}

export async function getItem<T extends HNItem>(id: number): Promise<T | null> {
  const cacheKey = `item:${id}`;

  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  try {
    const item = await hnApi.get(`item/${id}.json`).json<T | null>();
    if (item) {
      setCache(cacheKey, item);
    }
    return item;
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
    return null;
  }
}

export async function getStory(id: number): Promise<HNStory | null> {
  return getItem<HNStory>(id);
}

export async function getComment(id: number): Promise<HNComment | null> {
  return getItem<HNComment>(id);
}

export async function getUser(username: string): Promise<HNUser | null> {
  const cacheKey = `user:${username}`;

  const cached = getCached<HNUser>(cacheKey);
  if (cached) return cached;

  try {
    const user = await hnApi.get(`user/${username}.json`).json<HNUser | null>();
    if (user) {
      setCache(cacheKey, user);
    }
    return user;
  } catch (error) {
    console.error(`Error fetching user ${username}:`, error);
    return null;
  }
}

export async function getStories(
  type: FeedType,
  limit: number = 30,
  offset: number = 0
): Promise<HNStory[]> {
  const ids = await getStoryIds(type);
  const slicedIds = ids.slice(offset, offset + limit);

  const stories = await Promise.all(
    slicedIds.map((id) => getStory(id))
  );

  return stories.filter((story): story is HNStory => story !== null && !story.deleted && !story.dead);
}

export async function getCommentTree(
  commentIds: number[],
  depth: number = 0,
  maxDepth: number = 10
): Promise<(HNComment & { replies: HNComment[] })[]> {
  if (depth >= maxDepth || commentIds.length === 0) {
    return [];
  }

  const comments = await Promise.all(
    commentIds.map((id) => getComment(id))
  );

  const validComments = comments.filter(
    (c): c is HNComment => c !== null && !c.deleted && !c.dead
  );

  const commentsWithReplies = await Promise.all(
    validComments.map(async (comment) => {
      const replies = comment.kids
        ? await getCommentTree(comment.kids, depth + 1, maxDepth)
        : [];
      return { ...comment, replies };
    })
  );

  return commentsWithReplies;
}

// Utility functions
export function getDomain(url?: string): string {
  if (!url) return '';
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function getHNUrl(itemId: number): string {
  return `https://news.ycombinator.com/item?id=${itemId}`;
}

export function getUserUrl(username: string): string {
  return `https://news.ycombinator.com/user?id=${username}`;
}
