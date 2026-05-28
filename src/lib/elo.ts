// Standard Elo rating math, shared by PVE (vs AI) and PVP (online) updates.

export const DEFAULT_ELO = 0;
const K_FACTOR = 24;

// Coins awarded per finished rated game (shop currency).
export const COINS_WIN = 10;
export const COINS_DRAW = 5;
export const COINS_LOSS = 0;

// Coins for a result, given this side's score (1 win / 0.5 draw / 0 loss).
export function coinsFor(score: 0 | 0.5 | 1): number {
  return score === 1 ? COINS_WIN : score === 0.5 ? COINS_DRAW : COINS_LOSS;
}

// Fixed notional ratings for each AI difficulty — beating a harder bot gains
// more, losing to an easy bot costs more.
export const AI_RATING: Record<"easy" | "medium" | "hard", number> = {
  easy: 900,
  medium: 1400,
  hard: 1900,
};

// Expected score for `rating` against `opponent` (0..1).
export function expectedScore(rating: number, opponent: number): number {
  return 1 / (1 + Math.pow(10, (opponent - rating) / 400));
}

// New rating after a game. `score` is 1 win / 0.5 draw / 0 loss.
export function nextElo(
  rating: number,
  opponent: number,
  score: 0 | 0.5 | 1,
  k: number = K_FACTOR,
): number {
  return Math.round(rating + k * (score - expectedScore(rating, opponent)));
}

// Convert a Connect Four result into a score from `side`'s perspective.
// winner: 0 = draw, 1/2 = player number.
export function scoreFor(winner: 0 | 1 | 2, side: 1 | 2): 0 | 0.5 | 1 {
  if (winner === 0) return 0.5;
  return winner === side ? 1 : 0;
}
