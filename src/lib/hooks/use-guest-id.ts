"use client";

import { useEffect, useState } from "react";

// Stable per-browser identifier for guest (unauthenticated) play. Used as a
// fallback when a user isn't logged in but wants to join an online room.
export function useGuestId() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    const KEY = "foursight.guestId";
    let cur = localStorage.getItem(KEY);
    if (!cur) {
      cur = "g_" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(KEY, cur);
    }
    setId(cur);
  }, []);
  return id;
}

// Six-character room code (excludes confusable chars).
export function generateRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}
