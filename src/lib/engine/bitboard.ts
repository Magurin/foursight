// Bitboard representation for Connect Four (7 cols x 6 rows).
//
// Encoding (Pascal Pons style): each column uses 7 bits = 6 cells + 1 sentinel.
// Total bits used = 49. We use BigInt for safe bitwise ops on >32 bits.
//
// bit index = col * 7 + row  (row 0 = bottom of column)
//
// Two BigInts encode a position:
//   position : bits set for the CURRENT player's pieces
//   mask     : bits set for ALL occupied cells
// Opponent pieces = mask ^ position.
//
// After a move m (bit for the landing cell):
//   nextPosition = (position ^ mask)         // switch perspective
//   nextMask     = mask | m
// This is the canonical way to maintain perspective cheaply.

export const COLS = 7;
export const ROWS = 6;
export const H1 = BigInt(ROWS + 1); // 7
export const H2 = BigInt(ROWS + 2); // 8
export const SIZE = COLS * ROWS;

const BOTTOM_MASK_CACHE: bigint[] = (() => {
  const arr: bigint[] = [];
  for (let c = 0; c < COLS; c++) arr.push(1n << BigInt(c * (ROWS + 1)));
  return arr;
})();

const COLUMN_MASK_CACHE: bigint[] = (() => {
  const arr: bigint[] = [];
  for (let c = 0; c < COLS; c++) {
    let m = 0n;
    for (let r = 0; r < ROWS; r++) m |= 1n << BigInt(c * (ROWS + 1) + r);
    arr.push(m);
  }
  return arr;
})();

export function bottomMask(col: number): bigint {
  return BOTTOM_MASK_CACHE[col];
}

export function columnMask(col: number): bigint {
  return COLUMN_MASK_CACHE[col];
}

export function topMask(col: number): bigint {
  return 1n << BigInt(col * (ROWS + 1) + (ROWS - 1));
}

export function canPlay(mask: bigint, col: number): boolean {
  return (mask & topMask(col)) === 0n;
}

// Lowest free cell bit in a column given the current mask.
export function moveBit(mask: bigint, col: number): bigint {
  return (mask + bottomMask(col)) & columnMask(col);
}

// Detect 4-in-a-row for the bits in `pos`.
export function isWin(pos: bigint): boolean {
  // horizontal
  let m = pos & (pos >> H1);
  if ((m & (m >> (H1 * 2n))) !== 0n) return true;
  // diagonal /
  m = pos & (pos >> H2);
  if ((m & (m >> (H2 * 2n))) !== 0n) return true;
  // diagonal \
  m = pos & (pos >> BigInt(ROWS));
  if ((m & (m >> BigInt(ROWS * 2))) !== 0n) return true;
  // vertical
  m = pos & (pos >> 1n);
  if ((m & (m >> 2n)) !== 0n) return true;
  return false;
}

// Returns the bitmask of the 4 winning stones if `pos` contains a 4-in-a-row,
// otherwise 0n. Useful for highlighting the winning line.
export function winningLine(pos: bigint): bigint {
  const dirs: bigint[] = [1n, H1, H2, BigInt(ROWS)];
  for (const d of dirs) {
    const a = pos & (pos >> d);
    const b = a & (a >> (d * 2n));
    if (b !== 0n) {
      // b marks the bottom-left bit of the run; expand to all 4
      const start = b;
      return start | (start << d) | (start << (d * 2n)) | (start << (d * 3n));
    }
  }
  return 0n;
}

// Threats: cells where the given player would complete 4-in-a-row if filled.
export function computeWinningPositions(pos: bigint, mask: bigint): bigint {
  // Vertical
  let r = (pos << 1n) & (pos << 2n) & (pos << 3n);

  // Horizontal
  let p = (pos << H1) & (pos << (2n * H1));
  r |= p & (pos << (3n * H1));
  r |= p & (pos >> H1);
  p = (pos >> H1) & (pos >> (2n * H1));
  r |= p & (pos << H1);
  r |= p & (pos >> (3n * H1));

  // Diagonal /
  p = (pos << H2) & (pos << (2n * H2));
  r |= p & (pos << (3n * H2));
  r |= p & (pos >> H2);
  p = (pos >> H2) & (pos >> (2n * H2));
  r |= p & (pos << H2);
  r |= p & (pos >> (3n * H2));

  // Diagonal \
  const H0 = BigInt(ROWS);
  p = (pos << H0) & (pos << (2n * H0));
  r |= p & (pos << (3n * H0));
  r |= p & (pos >> H0);
  p = (pos >> H0) & (pos >> (2n * H0));
  r |= p & (pos << H0);
  r |= p & (pos >> (3n * H0));

  // Board mask of all playable cells (49 bits)
  const BOARD_MASK = ((1n << BigInt((ROWS + 1) * COLS)) - 1n) & ~(() => {
    let s = 0n;
    for (let c = 0; c < COLS; c++) s |= 1n << BigInt(c * (ROWS + 1) + ROWS);
    return s;
  })();

  return r & BOARD_MASK & ~mask;
}

// Render to a 2D grid: 0 empty, 1 first-to-move-overall, 2 other.
// Caller supplies which player's stones are in `position`.
export function toGrid(
  position: bigint,
  mask: bigint,
  positionPlayer: 1 | 2,
): (0 | 1 | 2)[][] {
  const grid: (0 | 1 | 2)[][] = [];
  const opp: 1 | 2 = positionPlayer === 1 ? 2 : 1;
  for (let r = ROWS - 1; r >= 0; r--) {
    const row: (0 | 1 | 2)[] = [];
    for (let c = 0; c < COLS; c++) {
      const bit = 1n << BigInt(c * (ROWS + 1) + r);
      if ((position & bit) !== 0n) row.push(positionPlayer);
      else if ((mask & bit) !== 0n) row.push(opp);
      else row.push(0);
    }
    grid.push(row);
  }
  return grid;
}

// Render the winning-line bitmask as a set of {row,col} coords.
export function bitsToCells(bits: bigint): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const bit = 1n << BigInt(c * (ROWS + 1) + r);
      if ((bits & bit) !== 0n) cells.push({ row: ROWS - 1 - r, col: c });
    }
  }
  return cells;
}
