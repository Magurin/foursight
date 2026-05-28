// Curated Connect Four puzzles. Each puzzle is defined by the sequence of
// columns played to set up the position, and the column the user must find.
//
// All puzzles must satisfy: after replaying `setup` from the empty board, the
// side to move can play `solution` and either (a) win immediately, or
// (b) avoid an immediate loss when no winning move exists, or
// (c) match the solver's best move at depth ≥ 8.
//
// We verify each puzzle in /api/smoke against the actual engine — if a puzzle
// drifts (e.g. someone reorders setup moves), the smoke test catches it.

import type { Player } from "@/lib/engine/game";
import type { Locale } from "@/lib/i18n/dictionary";

export type PuzzleTag = "Mate in 1" | "Block the threat" | "Opening" | "Tactics";

export interface Puzzle {
  id: string;
  // Moves played from the empty board (alternating, starting with Yellow).
  setup: number[];
  // Which player moves first overall (almost always 1 = Yellow).
  firstPlayer: Player;
  // The column index (0..6) that solves the puzzle.
  solution: number;
  // One-line task shown to the user, per locale.
  prompt: Record<Locale, string>;
  // Shown after a correct answer, per locale.
  explanation: Record<Locale, string>;
  // 1 (easy) — 3 (hard).
  difficulty: 1 | 2 | 3;
  tag: PuzzleTag;
}

export const TAG_KEYS: Record<PuzzleTag, "puzzles.tag.MateIn1" | "puzzles.tag.BlockTheThreat" | "puzzles.tag.Opening" | "puzzles.tag.Tactics"> = {
  "Mate in 1": "puzzles.tag.MateIn1",
  "Block the threat": "puzzles.tag.BlockTheThreat",
  Opening: "puzzles.tag.Opening",
  Tactics: "puzzles.tag.Tactics",
};

export const PUZZLES: Puzzle[] = [
  {
    id: "horizontal-mate-1",
    setup: [0, 6, 1, 6, 2, 6],
    firstPlayer: 1,
    solution: 3,
    prompt: {
      en: "Yellow to move — find the win in one.",
      ru: "Ход жёлтых — найди выигрыш в один ход.",
    },
    explanation: {
      en: "Three Yellow stones in a row at columns 1–3. Playing column 4 completes four-in-a-row horizontally.",
      ru: "Три жёлтые фишки подряд в колонках 1–3. Ход в колонку 4 завершает четыре в ряд по горизонтали.",
    },
    difficulty: 1,
    tag: "Mate in 1",
  },
  {
    id: "vertical-mate-1",
    setup: [4, 0, 4, 1, 4, 2],
    firstPlayer: 1,
    solution: 4,
    prompt: {
      en: "Yellow has built up a stack. Finish it.",
      ru: "Жёлтый собрал стопку. Заверши её.",
    },
    explanation: {
      en: "Three Yellows in a column. Drop a fourth on top to complete four vertically.",
      ru: "Три жёлтые в колонке. Брось четвёртую сверху — четыре по вертикали.",
    },
    difficulty: 1,
    tag: "Mate in 1",
  },
  {
    id: "must-block-horizontal",
    setup: [5, 0, 4, 1, 5, 2],
    firstPlayer: 1,
    solution: 3,
    prompt: {
      en: "Yellow to move. Red is threatening — what's the only move?",
      ru: "Ход жёлтых. Красный угрожает — какой единственный ход?",
    },
    explanation: {
      en: "If you don't block column 4, Red completes four-in-a-row across the bottom. This is the only saving move.",
      ru: "Если не заблокировать колонку 4, красный завершит четыре в ряд по нижнему ряду. Это единственный спасающий ход.",
    },
    difficulty: 2,
    tag: "Block the threat",
  },
  {
    id: "center-opening",
    setup: [],
    firstPlayer: 1,
    solution: 3,
    prompt: {
      en: "Empty board, Yellow to move. What's the best opening?",
      ru: "Пустая доска, ход жёлтых. Какое лучшее начало?",
    },
    explanation: {
      en: "The centre column is on the most possible four-in-a-rows. With perfect play, opening on the centre is a forced win for the first player.",
      ru: "Центральная колонка участвует в максимальном числе линий из четырёх. При лучшей игре выход в центр — форсированный выигрыш для первого игрока.",
    },
    difficulty: 1,
    tag: "Opening",
  },
  {
    id: "block-then-win",
    setup: [3, 3, 4, 4, 2, 5],
    firstPlayer: 1,
    solution: 1,
    prompt: {
      en: "Yellow to move — there's a hidden win on the bottom row.",
      ru: "Ход жёлтых — на нижнем ряду спрятан выигрыш.",
    },
    explanation: {
      en: "Yellow already owns columns 3, 4, and 5 bottom. Column 2 connects them into four-in-a-row across the bottom.",
      ru: "У жёлтых уже есть колонки 3, 4 и 5 в нижнем ряду. Колонка 2 соединяет их в четыре по горизонтали.",
    },
    difficulty: 2,
    tag: "Tactics",
  },

  // ── Added puzzles ───────────────────────────────────────────────
  // EASY (difficulty 1) — straight mates in one.
  {
    id: "h-mate-456",
    setup: [4, 0, 5, 1, 6, 0],
    firstPlayer: 1,
    solution: 3,
    prompt: {
      en: "Yellow to move — complete the row.",
      ru: "Ход жёлтых — заверши ряд.",
    },
    explanation: {
      en: "Yellow holds columns 5, 6, 7 on the bottom row. Column 4 makes four-in-a-row.",
      ru: "У жёлтых нижний ряд в колонках 5, 6, 7. Колонка 4 даёт четыре в ряд.",
    },
    difficulty: 1,
    tag: "Mate in 1",
  },
  {
    id: "v-mate-2",
    setup: [2, 0, 2, 1, 2, 6],
    firstPlayer: 1,
    solution: 2,
    prompt: {
      en: "Three high in column 3 — top it off.",
      ru: "Три фишки в колонке 3 — добавь верхнюю.",
    },
    explanation: {
      en: "A fourth Yellow on column 3 completes the vertical four.",
      ru: "Четвёртая жёлтая в колонке 3 завершает вертикаль.",
    },
    difficulty: 1,
    tag: "Mate in 1",
  },
  {
    id: "v-mate-4",
    setup: [4, 1, 4, 2, 4, 6],
    firstPlayer: 1,
    solution: 4,
    prompt: {
      en: "Yellow's stack in column 5 is one short.",
      ru: "Стопке жёлтых в колонке 5 не хватает одной.",
    },
    explanation: {
      en: "Drop the fourth Yellow on column 5 for a vertical four.",
      ru: "Брось четвёртую жёлтую в колонку 5 — вертикаль из четырёх.",
    },
    difficulty: 1,
    tag: "Mate in 1",
  },
  {
    id: "v-mate-5",
    setup: [5, 2, 5, 3, 5, 2],
    firstPlayer: 1,
    solution: 5,
    prompt: {
      en: "Finish the tower in column 6.",
      ru: "Заверши башню в колонке 6.",
    },
    explanation: {
      en: "Three Yellows stacked in column 6 — the fourth wins.",
      ru: "Три жёлтые в колонке 6 — четвёртая выигрывает.",
    },
    difficulty: 1,
    tag: "Mate in 1",
  },
  {
    id: "h-mate-012b",
    setup: [0, 5, 1, 6, 2, 5],
    firstPlayer: 1,
    solution: 3,
    prompt: {
      en: "Yellow to move — there's a win on the bottom row.",
      ru: "Ход жёлтых — на нижнем ряду есть выигрыш.",
    },
    explanation: {
      en: "Yellow owns columns 1, 2, 3 on the bottom. Column 4 completes four.",
      ru: "У жёлтых нижний ряд в колонках 1, 2, 3. Колонка 4 завершает четыре.",
    },
    difficulty: 1,
    tag: "Mate in 1",
  },

  // MEDIUM (difficulty 2) — blocks and gap-fills.
  {
    id: "block-456",
    setup: [0, 4, 1, 5, 0, 6],
    firstPlayer: 1,
    solution: 3,
    prompt: {
      en: "Yellow to move. Red threatens the bottom row — stop it.",
      ru: "Ход жёлтых. Красный угрожает нижним рядом — останови.",
    },
    explanation: {
      en: "Red holds columns 5, 6, 7. Only column 4 blocks the four-in-a-row.",
      ru: "У красного колонки 5, 6, 7. Только колонка 4 закрывает четыре в ряд.",
    },
    difficulty: 2,
    tag: "Block the threat",
  },
  {
    id: "block-vert-4",
    setup: [0, 4, 1, 4, 0, 4],
    firstPlayer: 1,
    solution: 4,
    prompt: {
      en: "Red is stacking column 5. Don't let it finish.",
      ru: "Красный строит колонку 5. Не дай завершить.",
    },
    explanation: {
      en: "Three Red in column 5 — Yellow must cap it on column 5.",
      ru: "Три красные в колонке 5 — жёлтый обязан закрыть колонку 5.",
    },
    difficulty: 2,
    tag: "Block the threat",
  },
  {
    id: "block-012b",
    setup: [6, 0, 5, 1, 6, 2],
    firstPlayer: 1,
    solution: 3,
    prompt: {
      en: "Red's bottom row is one move from winning.",
      ru: "Нижнему ряду красного остался один ход до победы.",
    },
    explanation: {
      en: "Red owns columns 1, 2, 3 — block column 4 immediately.",
      ru: "У красного колонки 1, 2, 3 — немедленно блокируй колонку 4.",
    },
    difficulty: 2,
    tag: "Block the threat",
  },
  {
    id: "gap-1234",
    setup: [1, 5, 2, 6, 4, 5],
    firstPlayer: 1,
    solution: 3,
    prompt: {
      en: "Yellow to move — fill the gap for the win.",
      ru: "Ход жёлтых — заполни брешь и выиграй.",
    },
    explanation: {
      en: "Yellow sits on columns 2, 3 and 5. Column 4 bridges them into four.",
      ru: "У жёлтых колонки 2, 3 и 5. Колонка 4 соединяет их в четыре.",
    },
    difficulty: 2,
    tag: "Tactics",
  },
  {
    id: "gap-2345",
    setup: [2, 0, 3, 1, 5, 0],
    firstPlayer: 1,
    solution: 4,
    prompt: {
      en: "There's a hidden four across the bottom.",
      ru: "На нижнем ряду спрятана четвёрка.",
    },
    explanation: {
      en: "Yellow holds columns 3, 4 and 6. Column 5 fills the gap to win.",
      ru: "У жёлтых колонки 3, 4 и 6. Колонка 5 заполняет брешь и выигрывает.",
    },
    difficulty: 2,
    tag: "Tactics",
  },
  {
    id: "gap-0123",
    setup: [0, 5, 2, 6, 3, 5],
    firstPlayer: 1,
    solution: 1,
    prompt: {
      en: "Yellow to move. Spot the bottom-row win.",
      ru: "Ход жёлтых. Найди выигрыш на нижнем ряду.",
    },
    explanation: {
      en: "Yellow holds columns 1, 3 and 4. Column 2 completes four across.",
      ru: "У жёлтых колонки 1, 3 и 4. Колонка 2 завершает четыре по ряду.",
    },
    difficulty: 2,
    tag: "Tactics",
  },
  {
    id: "block-vert-2",
    setup: [5, 2, 6, 2, 5, 2],
    firstPlayer: 1,
    solution: 2,
    prompt: {
      en: "Red's column 3 is about to top out — block it.",
      ru: "Колонка 3 красного вот-вот завершится — блокируй.",
    },
    explanation: {
      en: "Three Red stacked in column 3; Yellow must play column 3.",
      ru: "Три красные в колонке 3; жёлтый обязан сыграть колонку 3.",
    },
    difficulty: 2,
    tag: "Block the threat",
  },
  {
    id: "block-456b",
    setup: [1, 4, 0, 5, 1, 6],
    firstPlayer: 1,
    solution: 3,
    prompt: {
      en: "Red threatens the bottom row again. Only one save.",
      ru: "Красный снова грозит нижним рядом. Спасение одно.",
    },
    explanation: {
      en: "Red owns columns 5, 6, 7 — block column 4.",
      ru: "У красного колонки 5, 6, 7 — блокируй колонку 4.",
    },
    difficulty: 2,
    tag: "Block the threat",
  },

  // HARD (difficulty 3) — same mechanics, busier boards / distractors.
  {
    id: "block-distractor-h",
    setup: [4, 0, 4, 1, 5, 2],
    firstPlayer: 1,
    solution: 3,
    prompt: {
      en: "Tempting to build your own — but Red is winning first.",
      ru: "Хочется строить своё — но красный выигрывает первым.",
    },
    explanation: {
      en: "Red completes columns 1-3 unless you block column 4. Your own pair can wait.",
      ru: "Красный завершит колонки 1-3, если не блокировать колонку 4. Своя пара подождёт.",
    },
    difficulty: 3,
    tag: "Block the threat",
  },
  {
    id: "hidden-mate-clutter",
    setup: [0, 4, 1, 4, 2, 5],
    firstPlayer: 1,
    solution: 3,
    prompt: {
      en: "Yellow to move. The win is quieter than it looks.",
      ru: "Ход жёлтых. Выигрыш тише, чем кажется.",
    },
    explanation: {
      en: "Ignore Red's column 5 pair — Yellow's bottom row 1-3 wins on column 4.",
      ru: "Не отвлекайся на пару красного в колонке 5 — нижний ряд жёлтых 1-3 выигрывает колонкой 4.",
    },
    difficulty: 3,
    tag: "Tactics",
  },
  {
    id: "block-vert-distractor",
    setup: [5, 3, 5, 3, 6, 3],
    firstPlayer: 1,
    solution: 3,
    prompt: {
      en: "Your column 6 pair is bait. Look at Red.",
      ru: "Твоя пара в колонке 6 — приманка. Посмотри на красного.",
    },
    explanation: {
      en: "Red has three stacked in column 4 — block column 4 or lose.",
      ru: "У красного три в колонке 4 — блокируй колонку 4, иначе проигрыш.",
    },
    difficulty: 3,
    tag: "Block the threat",
  },
  {
    id: "gap-hard-0123",
    setup: [0, 5, 1, 6, 3, 5],
    firstPlayer: 1,
    solution: 2,
    prompt: {
      en: "Yellow to move — one column finishes it.",
      ru: "Ход жёлтых — одна колонка решает.",
    },
    explanation: {
      en: "Yellow holds columns 1, 2 and 4. Column 3 fills the gap for four.",
      ru: "У жёлтых колонки 1, 2 и 4. Колонка 3 заполняет брешь — четыре.",
    },
    difficulty: 3,
    tag: "Tactics",
  },
  {
    id: "gap-hard-3456",
    setup: [3, 0, 5, 1, 6, 0],
    firstPlayer: 1,
    solution: 4,
    prompt: {
      en: "A win is hiding on the right side of the bottom row.",
      ru: "Выигрыш прячется справа на нижнем ряду.",
    },
    explanation: {
      en: "Yellow holds columns 4, 6 and 7. Column 5 bridges them to four.",
      ru: "У жёлтых колонки 4, 6 и 7. Колонка 5 соединяет их в четыре.",
    },
    difficulty: 3,
    tag: "Tactics",
  },
  {
    id: "block-456-hard",
    setup: [0, 4, 0, 5, 1, 6],
    firstPlayer: 1,
    solution: 3,
    prompt: {
      en: "Don't admire your column 1 stack — Red is one move from four.",
      ru: "Не любуйся своей стопкой в колонке 1 — красному ход до четырёх.",
    },
    explanation: {
      en: "Red owns columns 5, 6, 7 on the bottom. Only column 4 saves you.",
      ru: "У красного нижний ряд в колонках 5, 6, 7. Спасает только колонка 4.",
    },
    difficulty: 3,
    tag: "Block the threat",
  },
];

// Pick the "puzzle of the day" deterministically based on UTC date.
export function puzzleOfTheDay(date = new Date()): Puzzle {
  const epoch = Date.UTC(2024, 0, 1);
  const day = Math.floor((date.getTime() - epoch) / (24 * 3600 * 1000));
  const idx = ((day % PUZZLES.length) + PUZZLES.length) % PUZZLES.length;
  return PUZZLES[idx];
}
