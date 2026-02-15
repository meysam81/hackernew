import { ref, onUnmounted } from "vue";
import { getStoryIds } from "@/lib/hn-client";
import type { FeedType } from "@/lib/hn-client";

// Module-level shared state
const newStoryCount = ref(0);
const newStoryIds = ref<number[]>([]);
const isEnabled = ref(true);

let pollTimer: ReturnType<typeof setInterval> | null = null;
let currentFeedType: string | null = null;
let currentIds: number[] = [];

const POLL_INTERVAL = 60_000; // 60 seconds

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

async function fetchFreshIds(feedType: string): Promise<number[]> {
  try {
    return await getStoryIds(feedType as FeedType, true);
  } catch {
    return [];
  }
}

function handleVisibilityChange() {
  if (document.hidden) {
    pausePolling();
  } else if (currentFeedType) {
    startPollingInternal();
  }
}

function startPollingInternal() {
  if (pollTimer) {
    return;
  }

  pollTimer = setInterval(async () => {
    if (!isEnabled.value || !currentFeedType) {
      return;
    }

    // Respect saveData
    const conn = (
      navigator as unknown as { connection?: { saveData?: boolean } }
    ).connection;
    if (conn?.saveData) {
      return;
    }

    const freshIds = await fetchFreshIds(currentFeedType);
    if (freshIds.length === 0) {
      return;
    }

    // Find IDs that are new (in fresh but not in current)
    const currentSet = new Set(currentIds);
    const newIds = freshIds.filter((id) => !currentSet.has(id));

    // Only count those that appear before the first current ID in the fresh list
    // (i.e., truly new stories at the top)
    const firstCurrentIndex = freshIds.findIndex((id) => currentSet.has(id));
    const topNewIds =
      firstCurrentIndex > 0
        ? freshIds.slice(0, firstCurrentIndex)
        : newIds.slice(0, 10);

    newStoryCount.value = topNewIds.length;
    newStoryIds.value = topNewIds;
  }, POLL_INTERVAL);
}

export function useAutoRefresh() {
  const startPolling = (feedType: string, existingIds: number[]) => {
    currentFeedType = feedType;
    currentIds = existingIds;
    newStoryCount.value = 0;
    newStoryIds.value = [];

    // Clean up previous timer
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }

    startPollingInternal();
  };

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  const consumeNewStories = (): number[] => {
    const ids = [...newStoryIds.value];
    // Update currentIds to include the new ones
    currentIds = [...ids, ...currentIds];
    newStoryCount.value = 0;
    newStoryIds.value = [];
    return ids;
  };

  onUnmounted(() => {
    stopPolling();
  });

  return {
    newStoryCount,
    newStoryIds,
    isEnabled,
    startPolling,
    stopPolling,
    consumeNewStories,
  };
}

function pausePolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
