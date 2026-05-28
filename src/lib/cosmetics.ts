// Cosmetics catalog for the in-game shop.
//
// Two kinds of items:
//  - Ball skins: a gradient applied to a player's discs. The same skin can be
//    equipped on either the "you" slot or the "opponent" slot.
//  - Board themes: the colored frame + empty-cell styling of the board.
//
// IMPORTANT: every Tailwind class used here is written as a complete literal
// string so the v4 source scanner includes it in the build. Never build these
// class names dynamically.

export type Slot = "player" | "opponent" | "board";

export interface BallSkin {
  id: string;
  name: { en: string; ru: string };
  price: number; // 0 = free / owned by everyone
  // Full gradient classes for the disc (combined with rounded-full etc).
  className: string;
}

export interface BoardTheme {
  id: string;
  name: { en: string; ru: string };
  price: number;
  // Outer frame gradient (light + dark).
  container: string;
  // Empty cell background + inset ring.
  cell: string;
  ring: string;
  // Cell background when its column is hovered.
  cellHover: string;
}

export const BALL_SKINS: BallSkin[] = [
  { id: "amber", name: { en: "Amber", ru: "Янтарь" }, price: 0, className: "bg-gradient-to-br from-amber-300 to-amber-500" },
  { id: "rose", name: { en: "Rose", ru: "Роза" }, price: 0, className: "bg-gradient-to-br from-rose-400 to-rose-600" },
  { id: "emerald", name: { en: "Emerald", ru: "Изумруд" }, price: 30, className: "bg-gradient-to-br from-emerald-300 to-emerald-600" },
  { id: "sky", name: { en: "Sky", ru: "Небо" }, price: 30, className: "bg-gradient-to-br from-sky-300 to-sky-600" },
  { id: "orange", name: { en: "Orange", ru: "Апельсин" }, price: 30, className: "bg-gradient-to-br from-orange-300 to-orange-600" },
  { id: "violet", name: { en: "Violet", ru: "Фиалка" }, price: 40, className: "bg-gradient-to-br from-violet-300 to-violet-600" },
  { id: "fuchsia", name: { en: "Fuchsia", ru: "Фуксия" }, price: 40, className: "bg-gradient-to-br from-fuchsia-300 to-fuchsia-600" },
  { id: "cyan", name: { en: "Cyan", ru: "Циан" }, price: 50, className: "bg-gradient-to-br from-cyan-300 to-cyan-600" },
  { id: "lime", name: { en: "Lime", ru: "Лайм" }, price: 50, className: "bg-gradient-to-br from-lime-300 to-lime-500" },
  { id: "slate", name: { en: "Steel", ru: "Сталь" }, price: 60, className: "bg-gradient-to-br from-slate-300 to-slate-600" },
  { id: "gold", name: { en: "Gold", ru: "Золото" }, price: 100, className: "bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500" },
  { id: "rainbow", name: { en: "Rainbow", ru: "Радуга" }, price: 100, className: "bg-gradient-to-br from-pink-400 via-violet-400 to-sky-400" },
];

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: "indigo",
    name: { en: "Classic Indigo", ru: "Классика (индиго)" },
    price: 0,
    container: "bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-950",
    cell: "bg-indigo-950/40",
    ring: "ring-indigo-300/10",
    cellHover: "bg-indigo-950/60",
  },
  {
    id: "slate",
    name: { en: "Slate", ru: "Графит" },
    price: 50,
    container: "bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-700 dark:to-slate-950",
    cell: "bg-slate-950/40",
    ring: "ring-slate-300/10",
    cellHover: "bg-slate-950/60",
  },
  {
    id: "emerald",
    name: { en: "Forest", ru: "Лес" },
    price: 50,
    container: "bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-700 dark:to-emerald-950",
    cell: "bg-emerald-950/40",
    ring: "ring-emerald-300/10",
    cellHover: "bg-emerald-950/60",
  },
  {
    id: "rose",
    name: { en: "Crimson", ru: "Багрянец" },
    price: 60,
    container: "bg-gradient-to-br from-rose-600 to-rose-800 dark:from-rose-700 dark:to-rose-950",
    cell: "bg-rose-950/40",
    ring: "ring-rose-300/10",
    cellHover: "bg-rose-950/60",
  },
  {
    id: "midnight",
    name: { en: "Midnight", ru: "Полночь" },
    price: 70,
    container: "bg-gradient-to-br from-zinc-700 to-zinc-900 dark:from-zinc-800 dark:to-black",
    cell: "bg-black/40",
    ring: "ring-white/10",
    cellHover: "bg-black/60",
  },
  {
    id: "sunset",
    name: { en: "Sunset", ru: "Закат" },
    price: 120,
    container: "bg-gradient-to-br from-fuchsia-600 to-amber-600 dark:from-fuchsia-800 dark:to-amber-800",
    cell: "bg-zinc-950/40",
    ring: "ring-white/10",
    cellHover: "bg-zinc-950/60",
  },
];

export const DEFAULT_BALL_PLAYER = "amber";
export const DEFAULT_BALL_OPPONENT = "rose";
export const DEFAULT_BOARD = "indigo";

export function ballSkin(id: string | null | undefined): BallSkin {
  return BALL_SKINS.find((b) => b.id === id) ?? BALL_SKINS[0];
}

export function boardTheme(id: string | null | undefined): BoardTheme {
  return BOARD_THEMES.find((b) => b.id === id) ?? BOARD_THEMES[0];
}

// Free items are owned by everyone implicitly.
export function isOwned(id: string, owned: string[] | null | undefined): boolean {
  const all = [...BALL_SKINS, ...BOARD_THEMES];
  const item = all.find((i) => i.id === id);
  if (item && item.price === 0) return true;
  return (owned ?? []).includes(id);
}

export interface ResolvedSkins {
  youSide: 1 | 2;
  ballYou: string; // gradient className for the human's discs
  ballOpp: string; // gradient className for the opponent's discs
  board: BoardTheme;
}

// Pick the right skins from a profile. `youSide` is which board side (1/2) the
// local human plays — their discs get the player skin, the other side gets the
// opponent skin.
export function resolveSkins(
  profile:
    | { cosmetic_player?: string | null; cosmetic_opponent?: string | null; cosmetic_board?: string | null }
    | null
    | undefined,
  youSide: 1 | 2 = 1,
): ResolvedSkins {
  return {
    youSide,
    ballYou: ballSkin(profile?.cosmetic_player ?? DEFAULT_BALL_PLAYER).className,
    ballOpp: ballSkin(profile?.cosmetic_opponent ?? DEFAULT_BALL_OPPONENT).className,
    board: boardTheme(profile?.cosmetic_board ?? DEFAULT_BOARD),
  };
}
