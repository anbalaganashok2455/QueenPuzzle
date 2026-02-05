import { Box, Button, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import {
  SIZE,
  createEmptyBoard,
  generateRegions,
  generateSolution,
  isValidMove,
  checkWin,
  type CellState
} from "./components/PuzzleLogic";

import BackGround from "./assets/BackGround.png";

export default function App() {
  const [board, setBoard] = useState<CellState[][]>([]);
  const [regions, setRegions] = useState<number[][]>([]);
  const [solution, setSolution] = useState<any[]>([]);
  const [won, setWon] = useState(false);

  const [visible, setVisible] = useState(true);
  const [name, setName] = useState("");

  const startGame = () => {
    let sol;
    let reg:any;

    do {
      sol = generateSolution()!;
      reg = generateRegions();
    } while (
      new Set(sol.map(q => reg[q.row][q.col])).size !== SIZE
    );

    setSolution(sol);
    setRegions(reg);
    setBoard(createEmptyBoard());
    setWon(false);
  };

  useEffect(() => {
    startGame();
  }, []);

  const handleTap = (r: number, c: number) => {
    if (won) return;

    const newBoard = board.map(row => [...row]);
    const cell = newBoard[r][c];

    if (cell === "empty") {
      newBoard[r][c] = "x";
    } else if (cell === "x") {
      if (isValidMove(board, regions, r, c)) {
        newBoard[r][c] = "queen";
      }
    } else {
      newBoard[r][c] = "empty";
    }

    setBoard(newBoard);

    if (checkWin(newBoard, regions)) {
      setWon(true);
    }
  };

  const solvePuzzle = () => {
    const solved = createEmptyBoard();

    solution.forEach(q => {
      solved[q.row][q.col] = "queen";
    });

    setBoard(solved);
    setWon(true);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${BackGround})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {visible ? (
        <Box
          sx={{
            background: "rgba(0,0,0,0.75)",
            padding: 3,
            borderRadius: 3,
            textAlign: "center",
            width: 300,
            m: "0.5rem"
          }}
        >
          <Typography color="white" mb={2} fontSize={18}>
            Enter Player Name
          </Typography>

          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            sx={{
              mb: 3,
              input: { color: "white" },
              label: { color: "white" },
              "& label.Mui-focused": { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "white" },
                "&:hover fieldset": { borderColor: "white" },
                "&.Mui-focused fieldset": { borderColor: "white" }
              }
            }}
            value={name}
            onChange={e => setName(e.target.value)}
          />

          {name && (
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setVisible(false)}
              sx={{
                minWidth: 120,
                color: "white",
                borderColor: "white"
              }}
            >
              Start Game
            </Button>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            background: "rgba(0,0,0,0.65)",
            padding: 2,
            borderRadius: 3,
            boxShadow: "0 0 30px rgba(0,0,0,0.9)",
            width: "100%",
            maxWidth: 420,
            m: "0.5rem"
          }}
        >
          <Typography
            mb={2}
            textAlign="center"
            sx={{
              color: "#fff",
              textShadow: "0 0 10px black",
              fontSize: "2rem"
            }}
          >
            Hello {name} Play Well
          </Typography>

          <Box
            display="grid"
            gridTemplateColumns={`repeat(${SIZE}, 1fr)`}
            gap={0.4}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const color = regions[r]?.[c] ?? 0;

                return (
                  <Box
                    key={`${r}-${c}`}
                    onClick={() => handleTap(r, c)}
                    sx={{
                      aspectRatio: "1",
                      border: "1px solid #444",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      fontWeight: 700,
                      cursor: "pointer",
                      userSelect: "none",
                      background: `hsl(${color * 45},70%,85%)`
                    }}
                  >
                    {cell === "queen" && (
                      <span style={{ textShadow: "0 0 8px gold" }}>♛</span>
                    )}
                    {cell === "x" && "✕"}
                  </Box>
                );
              })
            )}
          </Box>

          {won && (
            <Typography
              mt={2}
              textAlign="center"
              sx={{
                color: "#00ff99",
                fontWeight: "bold",
                textShadow: "0 0 8px black"
              }}
            >
              Congratulations Puzzle Solved!
            </Typography>
          )}

          <Box mt={2} display="flex" gap={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={startGame}
              sx={{
                minWidth: 120,
                color: "white",
                borderColor: "white"
              }}
            >
              Reset
            </Button>

            <Button
              variant="outlined"
              onClick={solvePuzzle}
              sx={{
                minWidth: 120,
                color: "white",
                borderColor: "white"
              }}
            >
              Solve
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
