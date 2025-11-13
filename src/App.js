import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import "./App.css";

const SIZE = 6;
const SYMBOLS = {
  girl: "💃",
  guy: "🕺",
};

// Generate a full valid random grid
const generateFullGrid = () => {
  let grid = Array(SIZE)
    .fill(null)
    .map(() => Array(SIZE).fill(null));

  const isValidPlacement = (grid, r, c, val) => {
    // Rule 1: No triples
    if (c >= 2 && grid[r][c - 1] === val && grid[r][c - 2] === val) return false;
    if (r >= 2 && grid[r - 1][c] === val && grid[r - 2][c] === val) return false;

    // Rule 2: Each row/column <= SIZE/2 of each
    const rowVals = grid[r].slice(0, c).concat(val);
    const colVals = grid.map((row, i) => (i < r ? row[c] : null)).filter(Boolean);
    const rowCount = rowVals.filter((v) => v === val).length;
    const colCount = colVals.filter((v) => v === val).length;
    if (rowCount > SIZE / 2 || colCount > SIZE / 2) return false;

    return true;
  };

  const fillGrid = (r = 0, c = 0) => {
    if (r === SIZE) return true;
    const nextR = c === SIZE - 1 ? r + 1 : r;
    const nextC = c === SIZE - 1 ? 0 : c + 1;

    const options = Math.random() > 0.5 ? ["girl", "guy"] : ["guy", "girl"];
    for (let val of options) {
      if (isValidPlacement(grid, r, c, val)) {
        grid[r][c] = val;
        if (fillGrid(nextR, nextC)) return true;
        grid[r][c] = null;
      }
    }
    return false;
  };

  fillGrid();
  return grid;
};

// Choose random pre-filled cells
const randomizeFixedCells = (fullGrid) => {
  const newGrid = fullGrid.map((row) => [...row]);
  let fixedGrid = Array(SIZE)
    .fill(null)
    .map(() => Array(SIZE).fill(null));

  const totalFixed = Math.floor(SIZE * SIZE * 0.3); // 30% of grid fixed
  let cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      cells.push([r, c]);
    }
  }

  cells.sort(() => Math.random() - 0.5);
  cells.slice(0, totalFixed).forEach(([r, c]) => {
    fixedGrid[r][c] = newGrid[r][c];
  });

  return fixedGrid;
};

export default function App() {
  const [initialGrid, setInitialGrid] = useState([]);
  const [grid, setGrid] = useState([]);
  const [message, setMessage] = useState("");

  // 🔄 Generate a random puzzle on mount
  useEffect(() => {
    const full = generateFullGrid();
    const fixed = randomizeFixedCells(full);
    setInitialGrid(fixed);
    setGrid(fixed.map((r) => [...r]));
  }, []);

  const toggleCell = (r, c) => {
    if (initialGrid[r][c] !== null) return;
    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row]);
      const current = newGrid[r][c];
      newGrid[r][c] =
        current === "girl" ? "guy" : current === "guy" ? null : "girl";
      return newGrid;
    });
  };

  const checkNoTriples = (arr) => {
    for (let i = 0; i < arr.length - 2; i++) {
      if (arr[i] && arr[i] === arr[i + 1] && arr[i] === arr[i + 2]) return false;
    }
    return true;
  };

  const checkEqualCounts = (arr) => {
    const girls = arr.filter((x) => x === "girl").length;
    const guys = arr.filter((x) => x === "guy").length;
    return girls <= SIZE / 2 && guys <= SIZE / 2;
  };

  const validate = () => {
    for (let i = 0; i < SIZE; i++) {
      let row = grid[i];
      let col = grid.map((r) => r[i]);

      if (!checkNoTriples(row) || !checkNoTriples(col)) {
        setMessage("❌ No three identical dancers in a row or column!");
        return;
      }

      if (!checkEqualCounts(row) || !checkEqualCounts(col)) {
        setMessage("⚖️ Each row and column must have equal 💃 and 🕺!");
        return;
      }
    }

    const allFilled = grid.every((row) => row.every((cell) => cell !== null));
    if (!allFilled) {
      setMessage("🟡 Still some empty spots!");
      return;
    }

    setMessage("🎉 Perfect Tango! Puzzle solved!");
    launchConfetti();
  };

  const clearAll = () => {
    setGrid(
      initialGrid.map((row, r) =>
        row.map((cell, c) => (initialGrid[r][c] !== null ? initialGrid[r][c] : null))
      )
    );
    setMessage("");
  };

  const launchConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  if (grid.length === 0) return <div className="app">🌀 Loading puzzle...</div>;

  return (
    <div className="app">
      <h1>💃🕺 Tango Logic Puzzle</h1>
      <p> Each refresh brings a new dance challenge!</br>
    Rules:1) Each row and colum must contain equal number of charaters</br>
          2) In the same row there must not be more than 2 characters concecutively!!</br>
          3) This is just a game play simple and be Happy !!!</p>

      <div className="grid">
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`cell ${initialGrid[r][c] ? "fixed" : ""}`}
              onClick={() => toggleCell(r, c)}
            >
              {cell ? SYMBOLS[cell] : ""}
            </div>
          ))
        )}
      </div>

      <div className="buttons">
        <button onClick={validate} className="check-btn">
          Check Puzzle
        </button>
        <button onClick={clearAll} className="clear-btn">
          Clear All
        </button>
      </div>

      {message && <div className="message">{message}</div>}
    </div>
  );
}
