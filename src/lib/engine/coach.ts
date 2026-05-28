// AI Coach: post-game analyzer.
//
// For each ply we ask the engine for the best move, compare with what was
// actually played, and produce:
//   - a label  ("Best", "Good", "Inaccuracy", "Mistake", "Blunder", "Missed win",
//                "Forced", "Brilliant")
//   - an `evalBefore` and `evalAfter` (eval from the side-to-move's POV before
//     and after the actual move). Used to draw an eval graph.
//   - a one-sentence explanation generated from a small set of threat templates.
//
// All explanations are deterministic — no LLM, no API key. The templates are
// driven by board patterns the engine already detects (immediate wins, open
// threes, forks), so the prose stays grounded in real positions.

import {
  COLS,
  H1,
  H2,
  ROWS,
  canPlay,
  computeWinningPositions,
  isWin,
  moveBit,
} from "./bitboard";
import { GameState, Player, emptyGame, play, status } from "./game";
import { solve } from "./solver";
import { Locale, translate } from "@/lib/i18n/dictionary";

export type Label =
  | "Best"
  | "Brilliant"
  | "Good"
  | "Book"
  | "Inaccuracy"
  | "Mistake"
  | "Blunder"
  | "Missed win"
  | "Forced";

export interface CoachMove {
  ply: number;             // 0-indexed move number
  player: Player;
  col: number;             // column played
  bestCol: number;         // engine's preferred column
  label: Label;
  evalBefore: number;      // engine score from current side-to-move's POV
  evalAfter: number;       // engine score for opponent after this move (negate to render)
  explanation: string;
}

export interface CoachReport {
  moves: CoachMove[];
  // High-level summary stats per player
  summary: {
    player1: { blunders: number; mistakes: number; inaccuracies: number; bestPct: number };
    player2: { blunders: number; mistakes: number; inaccuracies: number; bestPct: number };
  };
}

const playerNameKey = (p: Player) =>
  p === 1 ? ("coach.color.yellow" as const) : ("coach.color.red" as const);

function popcount(x: bigint): number {
  let n = 0;
  while (x) {
    x &= x - 1n;
    n++;
  }
  return n;
}

// True if playing `col` results in an immediate win for the side to move.
function isWinningMove(position: bigint, mask: bigint, col: number): boolean {
  if (!canPlay(mask, col)) return false;
  const m = moveBit(mask, col);
  return isWin(position | m);
}

// True if the OPPONENT could win on their next move given current board.
function opponentWinningCols(position: bigint, mask: bigint): number[] {
  const opp = mask ^ position;
  const wins: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (!canPlay(mask, c)) continue;
    const m = moveBit(mask, c);
    if (isWin(opp | m)) wins.push(c);
  }
  return wins;
}

// After playing `col`, count winning replies the player has (forks).
// Returns the number of distinct columns from which the moving player can
// win on their next-next move (i.e. number of threats they hold).
function countOwnThreatsAfter(position: bigint, mask: bigint, col: number): number {
  const m = moveBit(mask, col);
  const newMask = mask | m;
  // After our move, perspective flips; our bits become (newMask ^ flippedPos).
  // Simpler: our bits = position | m.
  const ours = position | m;
  const winSpots = computeWinningPositions(ours, newMask);
  // Threats must be playable (i.e. on a non-overhang cell). computeWinningPositions
  // already masks out occupied cells but doesn't enforce gravity. Filter to
  // cells where the column's "next playable" cell equals the threat cell.
  let n = 0;
  const seenCols = new Set<number>();
  for (let c = 0; c < COLS; c++) {
    if (!canPlay(newMask, c)) continue;
    const next = moveBit(newMask, c);
    if ((winSpots & next) !== 0n && !seenCols.has(c)) {
      seenCols.add(c);
      n++;
    }
  }
  return n;
}

function classifyByDelta(delta: number): Label {
  if (delta <= 1) return "Best";
  if (delta <= 3) return "Good";
  if (delta <= 6) return "Inaccuracy";
  if (delta <= 12) return "Mistake";
  return "Blunder";
}

interface PlyContext {
  state: GameState;
  col: number;
  player: Player;
}

function buildExplanation(
  ctx: PlyContext,
  label: Label,
  bestCol: number,
  locale: Locale,
): string {
  const { state, col, player } = ctx;
  const opp = translate(locale, playerNameKey(player === 1 ? 2 : 1));
  const self = translate(locale, playerNameKey(player));
  const t = translate;

  // Detect specific patterns.
  const oppWins = opponentWinningCols(state.position, state.mask);
  const playedWasOnlyDefense =
    oppWins.length === 1 && oppWins[0] === col;
  const missedDefense = oppWins.length > 0 && !oppWins.includes(col);
  const ownThreats = countOwnThreatsAfter(state.position, state.mask, col);
  const playedWasWinning = isWinningMove(state.position, state.mask, col);
  const bestWasWinning =
    bestCol !== -1 && isWinningMove(state.position, state.mask, bestCol);

  if (playedWasWinning) return t(locale, "coach.expl.winning_move");
  if (bestWasWinning && !playedWasWinning)
    return t(locale, "coach.expl.missed_win", { best: bestCol + 1 });
  if (missedDefense)
    return t(locale, "coach.expl.missed_defense", { opp, block: oppWins[0] + 1 });
  if (playedWasOnlyDefense)
    return t(locale, "coach.expl.forced_block", { opp, col: col + 1 });
  if (ownThreats >= 2)
    return t(locale, "coach.expl.fork", { n: ownThreats, opp });
  if (label === "Best" && col === 3 && state.moves.length === 0)
    return t(locale, "coach.expl.opening_center");
  if (label === "Best") return t(locale, "coach.expl.best", { self });
  if (label === "Good") {
    return bestCol === col
      ? t(locale, "coach.expl.good_match")
      : t(locale, "coach.expl.good_close", { best: bestCol + 1 });
  }
  if (label === "Inaccuracy")
    return t(locale, "coach.expl.inaccuracy", { best: bestCol + 1 });
  if (label === "Mistake")
    return t(locale, "coach.expl.mistake", { best: bestCol + 1, self });
  if (label === "Blunder")
    return t(locale, "coach.expl.blunder", { best: bestCol + 1, opp });
  return "";
}

export interface AnalyzeOptions {
  depth?: number;       // engine search depth per move
  timePerMoveMs?: number;
  firstPlayer?: Player;
  locale?: Locale;
}

export function analyzeGame(moves: number[], opts: AnalyzeOptions = {}): CoachReport {
  const depth = opts.depth ?? 7;
  const timePerMove = opts.timePerMoveMs ?? 250;
  const firstPlayer = opts.firstPlayer ?? 1;
  const locale: Locale = opts.locale ?? "en";

  const out: CoachMove[] = [];
  let state = emptyGame(firstPlayer);

  for (let ply = 0; ply < moves.length; ply++) {
    const col = moves[ply];
    const player = ply % 2 === 0 ? firstPlayer : ((firstPlayer === 1 ? 2 : 1) as Player);

    // Score before move from the side-to-move's POV.
    const before = solve(state, depth, timePerMove);
    const bestCol = before.bestCol;
    const evalBefore = before.scoreByCol.get(bestCol) ?? 0;
    const evalActual = before.scoreByCol.get(col) ?? evalBefore;

    const delta = Math.max(0, evalBefore - evalActual);

    // Apply move; eval after = -solve(new state) (opponent's POV) so eval graph
    // stays in the original side-to-move's frame: we'll just store evalActual.
    const nextState = play(state, col);
    if (!nextState) break;

    // Decide label with overrides for forced moves / missed wins.
    const playedWasWinning = isWinningMove(state.position, state.mask, col);
    const bestWasWinning = bestCol !== -1 && isWinningMove(state.position, state.mask, bestCol);
    const oppWins = opponentWinningCols(state.position, state.mask);
    const forcedOnly =
      oppWins.length === 1 && oppWins[0] === col;
    const missedDefense = oppWins.length > 0 && !oppWins.includes(col);

    let label: Label;
    if (playedWasWinning) label = "Best";
    else if (bestWasWinning) label = "Missed win";
    else if (forcedOnly) label = "Forced";
    else if (missedDefense) label = "Blunder";
    else label = classifyByDelta(delta);

    // Brilliant: best move was non-obvious (delta from #2 large) AND created a fork.
    if (label === "Best" && !playedWasWinning) {
      const threats = countOwnThreatsAfter(state.position, state.mask, col);
      if (threats >= 2) label = "Brilliant";
    }

    const explanation = buildExplanation({ state, col, player }, label, bestCol, locale);

    out.push({
      ply,
      player,
      col,
      bestCol,
      label,
      evalBefore,
      evalAfter: evalActual,
      explanation,
    });

    state = nextState;
  }

  const summarize = (p: Player) => {
    const mine = out.filter((m) => m.player === p);
    const blunders = mine.filter((m) => m.label === "Blunder").length;
    const mistakes = mine.filter((m) => m.label === "Mistake").length;
    const inaccuracies = mine.filter((m) => m.label === "Inaccuracy").length;
    const best = mine.filter((m) => m.label === "Best" || m.label === "Brilliant" || m.label === "Forced").length;
    const bestPct = mine.length === 0 ? 0 : Math.round((100 * best) / mine.length);
    return { blunders, mistakes, inaccuracies, bestPct };
  };

  return {
    moves: out,
    summary: {
      player1: summarize(1),
      player2: summarize(2),
    },
  };
}

export function labelColor(l: Label): { bg: string; text: string; ring: string } {
  switch (l) {
    case "Brilliant":
      return { bg: "bg-fuchsia-100 dark:bg-fuchsia-500/20", text: "text-fuchsia-800 dark:text-fuchsia-200", ring: "ring-fuchsia-400" };
    case "Best":
      return { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-800 dark:text-emerald-200", ring: "ring-emerald-400" };
    case "Good":
      return { bg: "bg-sky-100 dark:bg-sky-500/20", text: "text-sky-800 dark:text-sky-200", ring: "ring-sky-400" };
    case "Book":
    case "Forced":
      return { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-700 dark:text-zinc-300", ring: "ring-zinc-400" };
    case "Inaccuracy":
      return { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-800 dark:text-amber-200", ring: "ring-amber-400" };
    case "Mistake":
      return { bg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-800 dark:text-orange-200", ring: "ring-orange-400" };
    case "Blunder":
    case "Missed win":
      return { bg: "bg-rose-100 dark:bg-rose-500/20", text: "text-rose-800 dark:text-rose-200", ring: "ring-rose-400" };
  }
}

// Suppress unused-import warnings for H1/H2/ROWS — kept exported for downstream.
void H1; void H2; void ROWS;
