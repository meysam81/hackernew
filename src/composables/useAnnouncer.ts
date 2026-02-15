export function useAnnouncer() {
  const announce = (
    message: string,
    priority: "polite" | "assertive" = "polite",
  ) => {
    if (typeof document === "undefined") {
      return;
    }

    const el = document.getElementById("announcer");
    if (!el) {
      return;
    }

    el.setAttribute("aria-live", priority);
    // Clear first to force re-announcement of same message
    el.textContent = "";
    requestAnimationFrame(() => {
      el.textContent = message;
    });
  };

  return { announce };
}
