// Negamax + alpha-beta solver for Connect Four on bitboards.
//
// Score convention (from the side-to-move's perspective):
//   +(SIZE/2 + 1 - movesNeeded)  — current player wins in `movesNeeded` plies
//   -(SIZE/2 + 1 - movesNeeded)  — current player loses
//   0                             — draw or non-terminal at max depth
//
// We use iterative deepening with a time budget so the UI stays responsive.

import {
  COLS,
  ROWS,
  SIZE,
  canPlay,
  columnMask,
  isWin,
  moveBit,
} from "./bitboard";
import { GameState, legalColumns, status } from "./game";

const COLUMN_ORDER: number[] = (() => {
  // Explore center columns first — drastically improves alpha-beta pruning.
  const order: number[] = [];
  for (let i = 0; i < COLS; i++) {
    order.push(Math.floor(COLS / 2) + ((1 - 2 * (i % 2)) * Math.floor((i + 1) / 2)));
  }
  return order;
})();

const MAX_SCORE = SIZE / 2 + 1; // 22

// Detect immediate win for the side to move.
function findWinningMove(position: bigint, mask: bigint): number {
  for (const c of COLUMN_ORDER) {
    if (!canPlay(mask, c)) continue;
    const m = moveBit(mask, c);
    if (isWin(position | m)) return c;
  }
  return -1;
}

// Return columns that would not lose immediately (i.e. give opponent a win
// next move). Used as a soft move-ordering filter — for true correctness, you
// must also check whether the move *enables* an opponent threat.
function nonLosingMoves(position: bigint, mask: bigint): number[] {
  const out: number[] = [];
  for (const c of COLUMN_ORDER) {
    if (!canPlay(mask, c)) continue;
    const m = moveBit(mask, c);
    // After our move, the opponent gets the turn. Their pieces = (mask | m) ^ (position | m) = mask ^ position.
    // Check if they have a winning reply.
    const opp = mask ^ position;
    let lossNext = false;
    const newMask = mask | m;
    for (const c2 of COLUMN_ORDER) {
      if (!canPlay(newMask, c2)) continue;
      const m2 = moveBit(newMask, c2);
      if (isWin(opp | m2)) {
        lossNext = true;
        break;
      }
    }
    if (!lossNext) out.push(c);
  }
  return out;
}

// Negamax with alpha-beta. Returns score from side-to-move perspective.
function negamax(
  position: bigint,
  mask: bigint,
  ply: number,
  depthLeft: number,
  alpha: number,
  beta: number,
  deadlineMs: number,
): number {
  if (depthLeft === 0) return heuristic(position, mask);
  if (Date.now() > deadlineMs) return heuristic(position, mask);

  // Immediate win check for any legal move.
  for (const c of COLUMN_ORDER) {
    if (!canPlay(mask, c)) continue;
    const m = moveBit(mask, c);
    if (isWin(position | m)) {
      return MAX_SCORE - Math.floor((ply + 1) / 2);
    }
  }

  // Draw if board is full.
  if (ply >= SIZE) return 0;

  let max = MAX_SCORE - 1 - Math.floor((ply + 2) / 2);
  if (beta > max) {
    beta = max;
    if (alpha >= beta) return beta;
  }

  for (const c of COLUMN_ORDER) {
    if (!canPlay(mask, c)) continue;
    const m = moveBit(mask, c);
    // Make move (perspective flip).
    const nextPos = position ^ mask;
    const nextMask = mask | m;
    const score = -negamax(
      nextPos,
      nextMask,
      ply + 1,
      depthLeft - 1,
      -beta,
      -alpha,
      deadlineMs,
    );
    if (score >= beta) return score;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

// Window-of-4 heuristic for non-terminal nodes.
// We score by counting potential 4-windows: any unblocked sequence of 4 cells
// containing only our pieces (and empties) is good; with 3 of ours and 1
// empty is very good; opponent counts negatively.
function heuristic(position: bigint, mask: bigint): number {
  const opp = mask ^ position;
  let score = 0;

  // Central column bonus: each of our stones in column 3 = +3, opp = -3.
  const centerCol = columnMask(Math.floor(COLS / 2));
  score += 3 * popcount(position & centerCol);
  score -= 3 * popcount(opp & centerCol);

  // Score 3-in-a-row threats by counting computeWinningPositions-like patterns.
  // Quick form: count pairs that can extend.
  score += 4 * countThrees(position, mask);
  score -= 5 * countThrees(opp, mask);
  return score;
}

function popcount(x: bigint): number {
  let n = 0;
  while (x) {
    x &= x - 1n;
    n++;
  }
  return n;
}

// Number of cells that, if filled by `pos` owner, would complete 4-in-a-row.
function countThrees(pos: bigint, mask: bigint): number {
  // Bits where pos has exactly 3 in a row of 4 and the 4th cell is empty.
  // Use shifts.
  const H1 = BigInt(ROWS + 1);
  const H2 = BigInt(ROWS + 2);
  const H0 = BigInt(ROWS);

  let threats = 0n;

  for (const d of [1n, H1, H2, H0]) {
    // 3-in-a-row patterns: pos & (pos>>d) & (pos>>2d), needing empty at -d or +3d.
    const a = pos & (pos >> d);
    const b = a & (pos >> (2n * d));
    if (b === 0n) continue;
    // Extend forward
    const fwd = b << (3n * d);
    // Extend backward
    const back = b >> d;
    threats |= fwd & ~mask;
    threats |= back & ~mask;
  }

  // Also patterns like x_xx with the hole in the middle (x?xx and xx?x).
  // Skipped for speed; covered partially by simpler heuristic.

  return popcount(threats);
}

export interface SolveResult {
  bestCol: number;
  scoreByCol: Map<number, number>;
  depthReached: number;
}

// Solve from a GameState, returning best move and per-column scores.
// `maxDepth` capped by both ply remaining and time budget.
export function solve(state: GameState, maxDepth: number, timeBudgetMs: number): SolveResult {
  const st = status(state);
  if (st.kind !== "playing") {
    return { bestCol: -1, scoreByCol: new Map(), depthReached: 0 };
  }
  const deadline = Date.now() + timeBudgetMs;

  // Quick wins / quick blocks.
  const immediateWin = findWinningMove(state.position, state.mask);
  if (immediateWin !== -1) {
    const map = new Map<number, number>();
    map.set(immediateWin, MAX_SCORE);
    return { bestCol: immediateWin, scoreByCol: map, depthReached: 1 };
  }

  // Block opponent's immediate win.
  // After our move, opponent moves. So opponent's threats are based on `opp ^ ourMove`?
  // Equivalent: detect opponent threats with their current bits.
  const opp = state.mask ^ state.position;
  let oppWinCol = -1;
  for (const c of COLUMN_ORDER) {
    if (!canPlay(state.mask, c)) continue;
    const m = moveBit(state.mask, c);
    if (isWin(opp | m)) {
      oppWinCol = c;
      break;
    }
  }
  if (oppWinCol !== -1) {
    const map = new Map<number, number>();
    map.set(oppWinCol, 0);
    return { bestCol: oppWinCol, scoreByCol: map, depthReached: 1 };
  }

  // Iterative deepening from depth 2 up to maxDepth.
  const ply = state.moves.length;
  let bestCol = COLUMN_ORDER.find((c) => canPlay(state.mask, c))!;
  let bestScores = new Map<number, number>();
  let depthReached = 0;

  for (let depth = 2; depth <= maxDepth; depth++) {
    if (Date.now() > deadline) break;
    const scoresAtDepth = new Map<number, number>();
    let bestAtDepth = -Infinity;
    let bestColAtDepth = bestCol;
    for (const c of COLUMN_ORDER) {
      if (!canPlay(state.mask, c)) continue;
      const m = moveBit(state.mask, c);
      // Make move
      const nextPos = state.position ^ state.mask;
      const nextMask = state.mask | m;
      // If this move wins immediately, score is max.
      const ourBitsAfter = nextMask ^ nextPos; // our bits after the move
      let score: number;
      if (isWin(ourBitsAfter)) {
        score = MAX_SCORE - Math.floor((ply + 1) / 2);
      } else {
        score = -negamax(
          nextPos,
          nextMask,
          ply + 1,
          depth - 1,
          -MAX_SCORE,
          MAX_SCORE,
          deadline,
        );
      }
      scoresAtDepth.set(c, score);
      if (score > bestAtDepth) {
        bestAtDepth = score;
        bestColAtDepth = c;
      }
      if (Date.now() > deadline) break;
    }
    if (scoresAtDepth.size > 0) {
      bestCol = bestColAtDepth;
      bestScores = scoresAtDepth;
      depthReached = depth;
    }
    if (Date.now() > deadline) break;
  }

  return { bestCol, scoreByCol: bestScores, depthReached };
}

// Difficulty presets.
export interface AISettings {
  maxDepth: number;
  timeBudgetMs: number;
  randomness: number; // 0..1 chance of suboptimal move
}

export const AI_PRESETS: Record<"easy" | "medium" | "hard", AISettings> = {
  easy: { maxDepth: 2, timeBudgetMs: 300, randomness: 0.45 },
  medium: { maxDepth: 6, timeBudgetMs: 700, randomness: 0.1 },
  hard: { maxDepth: 10, timeBudgetMs: 1800, randomness: 0 },
};

// Pick a move with a difficulty preset. Easy mode occasionally plays
// a random legal move; otherwise picks the engine's best (or near-best with
// small noise).
export function pickAIMove(
  state: GameState,
  difficulty: "easy" | "medium" | "hard",
): SolveResult & { chosenCol: number } {
  const cfg = AI_PRESETS[difficulty];
  const legals = legalColumns(state);
  if (legals.length === 0) {
    return { bestCol: -1, scoreByCol: new Map(), depthReached: 0, chosenCol: -1 };
  }
  const res = solve(state, cfg.maxDepth, cfg.timeBudgetMs);
  let chosen = res.bestCol;
  if (cfg.randomness > 0 && Math.random() < cfg.randomness) {
    // Pick from legal moves weighted slightly toward center.
    const weighted: number[] = [];
    for (const c of legals) {
      const w = 4 - Math.abs(c - 3);
      for (let i = 0; i < Math.max(1, w); i++) weighted.push(c);
    }
    chosen = weighted[Math.floor(Math.random() * weighted.length)];
  }
  return { ...res, chosenCol: chosen };
}
