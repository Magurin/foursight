"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  GameState,
  emptyGame,
  play,
  status,
  undo,
  toMove,
} from "@/lib/engine/game";
import { COLS } from "@/lib/engine/bitboard";

export type Mode = "local" | "ai" | "online";
export type Difficulty = "easy" | "medium" | "hard";

export interface FinishedGame {
  moves: number[];
  firstPlayer: 1 | 2;
  mode: Mode;
  difficulty?: Difficulty;
  endedAt: number;
}

interface GameStoreState {
  state: GameState;
  mode: Mode;
  difficulty: Difficulty;
  hint: number | null; // suggested column, optional
  lastFinished: FinishedGame | null;
  // actions
  drop: (col: number) => void;
  reset: (mode?: Mode) => void;
  undo: () => void;
  setMode: (mode: Mode) => void;
  setDifficulty: (d: Difficulty) => void;
  setHint: (col: number | null) => void;
}

// Bitboard state uses BigInt — JSON.stringify doesn't handle that natively,
// so we (de)serialize via a tiny replacer/reviver around the moves array.
// We only persist the move list and config; the bitboards are rebuilt.
type Persisted = {
  moves: number[];
  mode: Mode;
  difficulty: Difficulty;
  firstPlayer: 1 | 2;
  lastFinished: FinishedGame | null;
};

function rebuild(moves: number[], firstPlayer: 1 | 2): GameState {
  let s = emptyGame(firstPlayer);
  for (const c of moves) {
    const next = play(s, c);
    if (!next) break;
    s = next;
  }
  return s;
}

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      state: emptyGame(1),
      mode: "local",
      difficulty: "easy",
      hint: null,
      lastFinished: null,
      drop: (col) => {
        const cur = get().state;
        const st = status(cur);
        if (st.kind !== "playing") return;
        if (col < 0 || col >= COLS) return;
        const next = play(cur, col);
        if (!next) return;
        const after = status(next);
        const update: Partial<GameStoreState> = { state: next, hint: null };
        if (after.kind !== "playing") {
          update.lastFinished = {
            moves: next.moves,
            firstPlayer: next.firstPlayer,
            mode: get().mode,
            difficulty: get().difficulty,
            endedAt: Date.now(),
          };
        }
        set(update);
      },
      reset: (mode) =>
        set((s) => ({
          state: emptyGame(1),
          mode: mode ?? s.mode,
          hint: null,
        })),
      undo: () => set((s) => ({ state: undo(s.state), hint: null })),
      setMode: (mode) => set({ mode, hint: null }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setHint: (col) => set({ hint: col }),
    }),
    {
      name: "foursight.game",
      storage: createJSONStorage(() => localStorage),
      partialize: (s): Persisted => ({
        moves: s.state.moves,
        mode: s.mode,
        difficulty: s.difficulty,
        firstPlayer: s.state.firstPlayer,
        lastFinished: s.lastFinished,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<Persisted> | undefined;
        if (!p) return current;
        return {
          ...current,
          state: rebuild(p.moves ?? [], (p.firstPlayer ?? 1) as 1 | 2),
          mode: p.mode ?? current.mode,
          difficulty: p.difficulty ?? current.difficulty,
          lastFinished: p.lastFinished ?? current.lastFinished,
        };
      },
    },
  ),
);

export function useToMove() {
  return useGameStore((s) => toMove(s.state));
}
