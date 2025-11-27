import log from "@/utils/logger";

// Time formatting utilities
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}d ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months}mo ago`;
  }

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Number formatting
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

// Pluralize helper
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
): string {
  const word = count === 1 ? singular : plural || `${singular}s`;
  return `${count} ${word}`;
}

// HTML sanitization for comment text
export function sanitizeHtml(html: string): string {
  // HN API returns HTML with <p>, <a>, <i>, <code>, <pre> tags
  // We need to preserve these but escape any potential XSS
  const allowedTags = ["p", "a", "i", "code", "pre", "b", "em", "strong"];

  // Create a temporary element to parse the HTML
  if (typeof document === "undefined") {
    // SSR fallback - basic escaping
    return html;
  }

  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Walk through all elements and remove non-allowed tags
  const walker = document.createTreeWalker(temp, NodeFilter.SHOW_ELEMENT);
  const nodesToRemove: Node[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode as Element;
    const tagName = node.tagName.toLowerCase();

    if (!allowedTags.includes(tagName)) {
      nodesToRemove.push(node);
    } else if (tagName === "a") {
      // Ensure links open in new tab and have noopener
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  }

  // Remove non-allowed nodes but keep their text content
  nodesToRemove.forEach((node) => {
    const text = document.createTextNode(node.textContent || "");
    node.parentNode?.replaceChild(text, node);
  });

  return temp.innerHTML;
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + "...";
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle function
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Local storage helpers with fallback
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    log.error("Error setting localStorage item", error);
  }
}

// Focus management
export function focusElement(selector: string): void {
  const element = document.querySelector<HTMLElement>(selector);
  element?.focus();
}

// Keyboard event helpers
export function isKeyboardClick(event: KeyboardEvent): boolean {
  return event.key === "Enter" || event.key === " ";
}
