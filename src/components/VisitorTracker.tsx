"use client";

import { useEffect } from "react";

export function VisitorTracker() {
  useEffect(() => {
    // Prevent duplicate logs in the same session
    const hasTracked = sessionStorage.getItem("visit_tracked_session");
    if (!hasTracked) {
      sessionStorage.setItem("visit_tracked_session", "true");
      fetch("/api/analytics/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: window.location.pathname }),
      }).catch((err) => console.error("Failed to track visit:", err));
    }
  }, []);

  return null;
}
