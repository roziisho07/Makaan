"use client";

const ANON_CLIENT_ID_KEY = "makaan_anon_client_id_v1";

export function getAnonymousClientId(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  const existingId = window.localStorage.getItem(ANON_CLIENT_ID_KEY);
  if (existingId) {
    return existingId;
  }

  const nextId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(ANON_CLIENT_ID_KEY, nextId);
  return nextId;
}
