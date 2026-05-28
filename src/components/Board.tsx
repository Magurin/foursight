"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { COLS, ROWS, toGrid } from "@/lib/engine/bitboard";
import { GameState, status } from "@/lib/engine/game";
import {
  boardTheme,
  ballSkin,
  DEFAULT_BALL_PLAYER,
  DEFAULT_BALL_OPPONENT,
  DEFAULT_BOARD,
  type ResolvedSkins,
} from "@/lib/cosmetics";

const DEFAULT_SKINS: ResolvedSkins = {
  youSide: 1,
  ballYou: ballSkin(DEFAULT_BALL_PLAYER).className,
  ballOpp: ballSkin(DEFAULT_BALL_OPPONENT).className,
  board: boardTheme(DEFAULT_BOARD),
};

interface Props {
  state: GameState;
  onDrop?: (col: number) => void;
  highlight?: number | null;
  disabled?: boolean;
  showHint?: number | null;
  // Overrides the outer max-width (e.g. for fullscreen focus mode).
  widthClassName?: string;
  // Equipped cosmetics. Defaults to the classic look.
  skins?: ResolvedSkins;
}

export function Board({
  state,
  onDrop,
  highlight,
  disabled,
  showHint,
  widthClassName = "max-w-[560px]",
  skins = DEFAULT_SKINS,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const grid = useMemo(() => {
    // `state.position` is from the to-move side. We want a stable mapping of
    // cells -> player so colors don't swap mid-game. We render directly from
    // bit positions: bits in (position ^ mask) belong to the side that JUST
    // moved (i.e. the opponent of `toMove`). Easier: rebuild via toGrid using
    // "positionPlayer = toMove". Then opponent gets the other color.
    const st = status(state);
    const toMovePlayer =
      st.kind === "playing" ? st.toMove : (state.moves.length % 2 === 0 ? state.firstPlayer : (state.firstPlayer === 1 ? 2 : 1));
    return toGrid(state.position, state.mask, toMovePlayer);
  }, [state]);

  const st = status(state);
  const winSet = useMemo(() => {
    if (st.kind !== "win") return new Set<string>();
    return new Set(st.line.map((c) => `${c.row}:${c.col}`));
  }, [st]);

  // Color of the side to move — used to tint the hover "ghost" preview piece.
  const toMovePlayer: 1 | 2 =
    st.kind === "playing"
      ? st.toMove
      : state.moves.length % 2 === 0
        ? state.firstPlayer
        : state.firstPlayer === 1
          ? 2
          : 1;

  const lastMoveCell = useMemo(() => {
    if (state.moves.length === 0) return null;
    const col = state.moves[state.moves.length - 1];
    // Find topmost stone in that column.
    for (let r = 0; r < ROWS; r++) {
      if (grid[r][col] !== 0) return { row: r, col };
    }
    return null;
  }, [state.moves, grid]);

  const activeCol = highlight ?? hover;

  // Where a piece dropped into `activeCol` would land (the lowest empty cell).
  // grid index 0 = top row, ROWS-1 = bottom row.
  const ghostRow = useMemo(() => {
    if (activeCol == null || disabled || st.kind !== "playing") return null;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r][activeCol] === 0) return r;
    }
    return null; // column full
  }, [activeCol, disabled, st.kind, grid]);

  return (
    <div className={cn("mx-auto w-full select-none", widthClassName)}>
      {/* column hover targets */}
      <div className="grid grid-cols-7 gap-1.5 pb-1">
        {Array.from({ length: COLS }).map((_, c) => (
          <button
            key={c}
            type="button"
            aria-label={`Drop in column ${c + 1}`}
            title={showHint === c ? "Рекомендованный ход" : undefined}
            disabled={disabled || st.kind !== "playing"}
            onMouseEnter={() => setHover(c)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(c)}
            onBlur={() => setHover(null)}
            onClick={() => onDrop?.(c)}
            className={cn(
              "h-6 rounded-sm text-[10px] font-medium transition",
              "text-zinc-400 dark:text-zinc-500",
              activeCol === c &&
                "bg-amber-200/60 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
              showHint === c && "ring-2 ring-emerald-400",
            )}
          >
            {showHint === c ? "★" : activeCol === c ? "▼" : ""}
          </button>
        ))}
      </div>

      <div className={cn("rounded-2xl p-3 shadow-lg", skins.board.container)}>
        <div className="grid grid-cols-7 gap-1.5">
          {grid.flatMap((row, r) =>
            row.map((cell, c) => {
              const isWinCell = winSet.has(`${r}:${c}`);
              const isLast =
                lastMoveCell && lastMoveCell.row === r && lastMoveCell.col === c;
              const isColHover = activeCol === c;
              return (
                <div
                  key={`${r}:${c}`}
                  onMouseEnter={() => setHover(c)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onDrop?.(c)}
                  className={cn(
                    "relative aspect-square rounded-full ring-1 ring-inset",
                    skins.board.cell,
                    skins.board.ring,
                    isColHover && st.kind === "playing" && skins.board.cellHover,
                    !disabled && st.kind === "playing" && "cursor-pointer",
                  )}
                >
                  {cell !== 0 && (
                    <div
                      className={cn(
                        "absolute inset-[6%] rounded-full shadow-[inset_0_-3px_0_rgba(0,0,0,0.18)] transition-transform",
                        cell === skins.youSide ? skins.ballYou : skins.ballOpp,
                        isWinCell && "ring-4 ring-white/90 scale-105",
                        isLast && !isWinCell && "ring-2 ring-white/70 animate-drop",
                      )}
                    />
                  )}
                  {/* Ghost preview: translucent disc in the to-move color showing
                      where a drop in the hovered column would land. */}
                  {cell === 0 && ghostRow === r && activeCol === c && (
                    <div
                      className={cn(
                        "pointer-events-none absolute inset-[6%] rounded-full opacity-40 ring-2 ring-inset ring-white/50",
                        toMovePlayer === skins.youSide ? skins.ballYou : skins.ballOpp,
                      )}
                    />
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
