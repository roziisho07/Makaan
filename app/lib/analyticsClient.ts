"use client";

import { getAnonymousClientId } from "./anonymousClient";

interface SearchEventPayload {
  query: string;
  filters?: Record<string, unknown>;
  resultIds?: string[];
  clickedListingId?: string;
}

export async function logSearchEvent(payload: SearchEventPayload) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    await fetch("/api/search-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: getAnonymousClientId(),
        ...payload,
      }),
    });
  } catch {
    // Avoid blocking user interactions when analytics requests fail.
  }
}
