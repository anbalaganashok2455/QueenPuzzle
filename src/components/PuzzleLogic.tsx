
export const SIZE = 8;

export type CellState = "empty" | "queen" | "x";

export interface Queen {
  row: number;
  col: number;
}

function isSafeClassic(
  placed: Queen[],
  candidate: Queen
) {
  return !placed.some(q => {
    if (q.row === candidate.row) return true;
    if (q.col === candidate.col) return true;

    if (
      Math.abs(q.row - candidate.row) ===
      Math.abs(q.col - candidate.col)
    ) return true;

    if (
      Math.abs(q.row - candidate.row) <= 1 &&
      Math.abs(q.col - candidate.col) <= 1
    ) return true;

    return false;
  });
}

function shuffle(arr: number[]) {

  const copy = [...arr];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function generateSolution(
  row = 0,
  placed: Queen[] = []
): Queen[] | null {

  if (row === SIZE) return placed;


  const cols = shuffle([...Array(SIZE).keys()]);

  for (const col of cols) {

    const q = { row, col };

    if (isSafeClassic(placed, q)) {

      const res = generateSolution(
        row + 1,
        [...placed, q]
      );

      if (res) return res;
    }
  }

  return null;
}


export function generateRegionsFromSolution(
  queens: Queen[]
) {

  const grid = Array.from({ length: SIZE }, () =>
    Array(SIZE).fill(-1)
  );

  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

  queens.forEach((q, i) => {
    grid[q.row][q.col] = i;
  });

  const queue = queens.map((q, i) => ({
    row: q.row,
    col: q.col,
    id: i
  }));

  const inBounds = (r:number,c:number) =>
    r>=0 && c>=0 && r<SIZE && c<SIZE;

  while (queue.length) {

    const cur = queue.shift()!;

    for (const [dr,dc] of dirs) {

      const nr = cur.row + dr;
      const nc = cur.col + dc;

      if (inBounds(nr,nc) && grid[nr][nc] === -1) {

        if (Math.random() > 0.3) {
          grid[nr][nc] = cur.id;
          queue.push({ row:nr,col:nc,id:cur.id });
        }
      }
    }
  }

  for (let r=0;r<SIZE;r++){
    for (let c=0;c<SIZE;c++){
      if (grid[r][c] === -1) {
        for (const [dr,dc] of dirs) {
          const nr=r+dr, nc=c+dc;
          if (inBounds(nr,nc) && grid[nr][nc] !== -1) {
            grid[r][c] = grid[nr][nc];
            break;
          }
        }
      }
    }
  }

  return grid;
}


export function createEmptyBoard() {
  return Array.from({ length: SIZE }, () =>
    Array<CellState>(SIZE).fill("empty")
  );
}


export function isValidMove(
  board: CellState[][],
  regions: number[][],
  r: number,
  c: number
) {

  for (let i=0;i<SIZE;i++){
    if (board[r][i] === "queen") return false;
    if (board[i][c] === "queen") return false;
  }

  const region = regions[r][c];

  for (let i=0;i<SIZE;i++){
    for (let j=0;j<SIZE;j++){
      if (
        regions[i][j] === region &&
        board[i][j] === "queen"
      ) return false;
    }
  }

  for (let dr=-1;dr<=1;dr++){
    for (let dc=-1;dc<=1;dc++){
      const nr=r+dr, nc=c+dc;
      if (
        nr>=0 && nc>=0 && nr<SIZE && nc<SIZE
      ) {
        if (board[nr][nc] === "queen") return false;
      }
    }
  }

  return true;
}


export function checkWin(
  board: CellState[][],
  regions: number[][]
) {

  const queens: number[][] = [];

  board.forEach((row,r)=>
    row.forEach((cell,c)=>{
      if (cell === "queen") queens.push([r,c]);
    })
  );

  if (queens.length !== SIZE) return false;

  const rows = new Set(queens.map(q=>q[0]));
  const cols = new Set(queens.map(q=>q[1]));
  const regs = new Set(queens.map(q=>regions[q[0]][q[1]]));

  return rows.size===SIZE && cols.size===SIZE && regs.size===SIZE;
}