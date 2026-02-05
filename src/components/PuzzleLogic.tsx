export const SIZE = 8;
const MIN_REGION_SIZE = 3;

export type CellState = "empty" | "queen" | "x";

export interface Queen {
  row: number;
  col: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isSafeClassic(placed: Queen[], c: Queen): boolean {
  return !placed.some(q =>
    q.row === c.row ||
    q.col === c.col ||
    Math.abs(q.row - c.row) === Math.abs(q.col - c.col) ||
    (Math.abs(q.row - c.row) <= 1 && Math.abs(q.col - c.col) <= 1)
  );
}

export function generateSolution(
  row = 0,
  placed: Queen[] = []
): Queen[] | null {
  if (row === SIZE) return placed;

  for (const col of shuffle([...Array(SIZE).keys()])) {
    const cand = { row, col };
    if (isSafeClassic(placed, cand)) {
      const res = generateSolution(row + 1, [...placed, cand]);
      if (res) return res;
    }
  }
  return null;
}

export function generateRegions(): number[][] {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const inBounds = (r:number,c:number) =>
    r>=0 && c>=0 && r<SIZE && c<SIZE;

  while (true) {
    const grid = Array.from({ length: SIZE }, () =>
      Array(SIZE).fill(-1)
    );

    const cells = shuffle(
      Array.from({ length: SIZE * SIZE }, (_, i) => ({
        r: Math.floor(i / SIZE),
        c: i % SIZE
      }))
    );

    let region = 0;
    let idx = 0;

    while (region < SIZE && idx < cells.length) {
      const start = cells[idx++];
      if (grid[start.r][start.c] !== -1) continue;

      const queue = [start];
      grid[start.r][start.c] = region;
      let count = 1;

      while (queue.length && count < MIN_REGION_SIZE) {
        const cur = queue.shift()!;
        for (const [dr,dc] of shuffle(dirs)) {
          const nr = cur.r + dr;
          const nc = cur.c + dc;
          if (inBounds(nr,nc) && grid[nr][nc] === -1) {
            grid[nr][nc] = region;
            queue.push({ r: nr, c: nc });
            count++;
            if (count === MIN_REGION_SIZE) break;
          }
        }
      }

      if (count < MIN_REGION_SIZE) break;
      region++;
    }

    if (region < SIZE) continue;

    let changed = true;
    while (changed) {
      changed = false;
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (grid[r][c] !== -1) continue;
          for (const [dr,dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (inBounds(nr,nc) && grid[nr][nc] !== -1) {
              grid[r][c] = grid[nr][nc];
              changed = true;
              break;
            }
          }
        }
      }
    }

    if (grid.every(r => r.every(c => c !== -1))) {
      return grid;
    }
  }
}

export function createEmptyBoard(): CellState[][] {
  return Array.from({ length: SIZE }, () =>
    Array<CellState>(SIZE).fill("empty")
  );
}

export function isValidMove(
  board: CellState[][],
  regions: number[][],
  r: number,
  c: number
): boolean {

  for (let i = 0; i < SIZE; i++) {
    if (board[r][i] === "queen") return false;
    if (board[i][c] === "queen") return false;
  }

  const reg = regions[r][c];
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (regions[i][j] === reg && board[i][j] === "queen") {
        return false;
      }
    }
  }

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr>=0 && nc>=0 &&
        nr<SIZE && nc<SIZE &&
        board[nr][nc] === "queen"
      ) return false;
    }
  }

  return true;
}

export function checkWin(
  board: CellState[][],
  regions: number[][]
): boolean {

  const queens: [number,number][] = [];
  board.forEach((row,r) =>
    row.forEach((c,col) => {
      if (c === "queen") queens.push([r,col]);
    })
  );

  if (queens.length !== SIZE) return false;

  const rows = new Set(queens.map(q => q[0]));
  const cols = new Set(queens.map(q => q[1]));
  const regs = new Set(queens.map(q => regions[q[0]][q[1]]));

  return (
    rows.size === SIZE &&
    cols.size === SIZE &&
    regs.size === SIZE
  );
}
