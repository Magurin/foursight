"use client";

import { useEffect, useRef } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { GameState, status } from "@/lib/engine/game";
import { AI_RATING, DEFAULT_ELO, coinsFor, nextElo, scoreFor } from "@/lib/elo";

interface Args {
  state: GameState;
  mode: "local" | "ai" | "online";
  difficulty?: "easy" | "medium" | "hard";
  // Set this to a stable ID for the "human player" (auth user id).
  playerId?: string | null;
  // Which side the human played (1 = first/yellow). Used for PVE rating.
  humanSide?: 1 | 2;
}

// On terminal game state, write a match row. Idempotent per browser session
// thanks to a sessionStorage key derived from (firstPlayer, moves...).
export function useMatchPersistence({ state, mode, difficulty, playerId, humanSide = 1 }: Args) {
  const persistedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!playerId) return;
    if (mode === "local") return; // not associated with a user account
    const st = status(state);
    if (st.kind === "playing") return;
    const key = `m:${state.firstPlayer}:${state.moves.join(",")}:${st.kind}`;
    if (persistedRef.current === key) return;
    const sessionKey = `foursight.persisted.${key}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(sessionKey)) {
      persistedRef.current = key;
      return;
    }
    persistedRef.current = key;
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    const winner = (st.kind === "win" ? st.winner : 0) as 0 | 1 | 2;
    supabase
      .from("matches")
      .insert({
        player_one: playerId,
        player_two: null,
        mode,
        ai_difficulty: mode === "ai" ? (difficulty ?? null) : null,
        winner,
        moves: state.moves,
        rated: mode === "ai",
        ended_at: new Date().toISOString(),
      })
      .then(({ error }: { error: unknown }) => {
        if (!error && typeof window !== "undefined") {
          sessionStorage.setItem(sessionKey, "1");
        }
      });

    // PVE rating + coins: update the player's elo_pve vs the AI's fixed rating
    // and award shop coins for the result.
    if (mode === "ai") {
      const aiRating = AI_RATING[difficulty ?? "medium"];
      const score = scoreFor(winner, humanSide);
      supabase
        .from("profiles")
        .select("elo_pve, coins")
        .eq("id", playerId)
        .maybeSingle()
        .then(({ data }: { data: { elo_pve: number; coins: number } | null }) => {
          const current = data?.elo_pve ?? DEFAULT_ELO;
          const updated = nextElo(current, aiRating, score);
          const coins = (data?.coins ?? 0) + coinsFor(score);
          supabase.from("profiles").update({ elo_pve: updated, coins }).eq("id", playerId);
        });
    }
  }, [state, mode, difficulty, playerId, humanSide]);
}
