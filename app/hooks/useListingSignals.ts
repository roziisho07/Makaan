"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAnonymousClientId } from "../lib/anonymousClient";

interface ListingSignalsState {
  viewedIds: string[];
  savedIds: string[];
}

const STORAGE_KEY = "makaan_listing_signals_v1";

const DEFAULT_STATE: ListingSignalsState = {
  viewedIds: [],
  savedIds: [],
};

function readState(): ListingSignalsState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(raw) as Partial<ListingSignalsState>;

    return {
      viewedIds: Array.isArray(parsed.viewedIds) ? parsed.viewedIds : [],
      savedIds: Array.isArray(parsed.savedIds) ? parsed.savedIds : [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function useListingSignals() {
  const [state, setState] = useState<ListingSignalsState>(() => readState());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const trackView = useCallback((listingId: string) => {
    setState((prev) => {
      if (prev.viewedIds.includes(listingId)) {
        return prev;
      }

      return {
        ...prev,
        viewedIds: [...prev.viewedIds, listingId],
      };
    });
  }, []);

  const setSaved = useCallback((listingId: string, saved: boolean) => {
    setState((prev) => {
      const exists = prev.savedIds.includes(listingId);

      if (saved && !exists) {
        return {
          ...prev,
          savedIds: [...prev.savedIds, listingId],
        };
      }

      if (!saved && exists) {
        return {
          ...prev,
          savedIds: prev.savedIds.filter((id) => id !== listingId),
        };
      }

      return prev;
    });
  }, []);

  const syncSavedToServer = useCallback(
    async (listingId: string, saved: boolean) => {
      try {
        await fetch("/api/saved-listings", {
          method: saved ? "POST" : "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            listingId,
            clientId: getAnonymousClientId(),
          }),
        });
      } catch {
        // Keep UX resilient when network calls fail.
      }
    },
    [],
  );

  const isSaved = useCallback(
    (listingId: string) => state.savedIds.includes(listingId),
    [state.savedIds],
  );

  const hasRecommendationSignals = useMemo(
    () => state.viewedIds.length + state.savedIds.length >= 2,
    [state.savedIds.length, state.viewedIds.length],
  );

  return {
    viewedIds: state.viewedIds,
    savedIds: state.savedIds,
    trackView,
    setSaved,
    syncSavedToServer,
    isSaved,
    hasRecommendationSignals,
  };
}
