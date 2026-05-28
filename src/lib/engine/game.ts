import {
  COLS,
  ROWS,
  bitsToCells,
  canPlay,
  isWin,
  moveBit,
  winningLine,
} from "./bitboard";

export type Player = 1 | 2;

export type GameStatus =
  | { kind: "playing"; toMove: Player }
  | { kind: "win"; winner: Player; line: { row: number; col: number }[] }
  | { kind: "draw" };

export interface GameState {
  // Bitboard for the player whose turn it is NOT (i.e. the side that just moved)
  // is `mask ^ position`. We keep `position` from the to-move perspective —
  // this matches the canonical Pons encoding and makes search natural.
  position: bigint;
  mask: bigint;
  // Sequence of columns played, ply order.
  moves: number[];
  // Which player moves first overall (always 1 in practice but kept explicit).
  firstPlayer: Player;
}

export function emptyGame(firstPlayer: Player = 1): GameState {
  return { position: 0n, mask: 0n, moves: [], firstPlayer };
}

export function toMove(state: GameState): Player {
  return ((state.moves.length + (state.firstPlayer === 1 ? 0 : 1)) % 2 === 0
    ? state.firstPlayer
    : state.firstPlayer === 1
      ? 2
      : 1) as Player;
}

export function legalColumns(state: GameState): number[] {
  const out: number[] = [];
  for (let c = 0; c < COLS; c++) if (canPlay(state.mask, c)) out.push(c);
  return out;
}

export function canPlayCol(state: GameState, col: number): boolean {
  return col >= 0 && col < COLS && canPlay(state.mask, col);
}

// Returns the new state after playing `col`, or null if illegal.
export function play(state: GameState, col: number): GameState | null {
  if (!canPlayCol(state, col)) return null;
  const m = moveBit(state.mask, col);
  // Pons-style update: flip perspective, then add move bit.
  //   pos'  = pos ^ mask   (now holds the NEW to-move side's pre-existing bits)
  //   mask' = mask | m
  const flipped = state.position ^ state.mask;
  return {
    position: flipped,
    mask: state.mask | m,
    moves: [...state.moves, col],
    firstPlayer: state.firstPlayer,
  };
}

// Did the *last* move (the one that produced `state`) win the game?
// We check: opponent-of-to-move = state.position ^ state.mask, but actually
// `state.position` after `play` is the new to-move's bits, so the player who
// just moved holds `state.position ^ state.mask`. Their stones include the
// move bit. Win = isWin(theirBits).
export function lastMoveWon(state: GameState): boolean {
  if (state.moves.length === 0) return false;
  const justMovedBits = state.position ^ state.mask;
  return isWin(justMovedBits);
}

export function status(state: GameState): GameStatus {
  if (lastMoveWon(state)) {
    const justMovedBits = state.position ^ state.mask;
    const line = bitsToCells(winningLine(justMovedBits));
    // Winner is the player who moved on the previous ply.
    const winner = ((state.moves.length % 2 === 1
      ? state.firstPlayer
      : state.firstPlayer === 1
        ? 2
        : 1) as Player);
    return { kind: "win", winner, line };
  }
  if (state.moves.length >= ROWS * COLS) return { kind: "draw" };
  return { kind: "playing", toMove: toMove(state) };
}

export function undo(state: GameState): GameState {
  if (state.moves.length === 0) return state;
  // Replay from scratch — simplest, fine for short games.
  const replay = state.moves.slice(0, -1);
  let s = emptyGame(state.firstPlayer);
  for (const c of replay) s = play(s, c)!;
  return s;
}

// Convenience: the player who would move at ply `n` (0-indexed).
export function playerAtPly(firstPlayer: Player, ply: number): Player {
  return ply % 2 === 0 ? firstPlayer : firstPlayer === 1 ? 2 : 1;
}
