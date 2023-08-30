import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Square } from "./components/Square";
import { TURNS, GAME_MODE } from "./constants";
import { checkWinnerFrom, checkEndGame } from "./logic/board";
import { WinnerModal } from "./components/WinnerModal";
import { resetGameStorage, saveGameStorage } from "./logic/storage/index";
import "./App.css";
import { MenuModal } from "./components/MenuModal";
import { RefreshIcon } from "./icons/RefreshIcon";
import { SettingsIcon } from "./icons/SettingsIcon";

function App() {
  const [isMachineTurn, setIsMachineTurn] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(TURNS.X);
  // Manera correcta de insertar el localstorage en un estado
  const [board, setBoard] = useState(() => {
    const savedBoard = window.localStorage.getItem("board");
    return savedBoard ? JSON.parse(savedBoard) : Array(9).fill(null);
  });
  const [turn, setTurn] = useState(() => {
    const savedTurn = window.localStorage.getItem("turn");
    return savedTurn ? savedTurn : selectedPlayer;
  });
  const [winner, setWinner] = useState(null); // null es que no hay ganador, false hay un empate
  const [gameMode, setGameMode] = useState(GAME_MODE.TWO_PLAYER);
  const [menu, setMenu] = useState(false);

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    setTurn(player);
    setBoard(Array(9).fill(null)); // Reinicia el tablero cuando se cambia de jugador
    setMenu(false);
  };

  const updateBoard = (index) => {
    if (board[index] !== null || winner) return;

    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);

    const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X;
    setTurn(newTurn);

    // Guardar partida
    saveGameStorage({
      board: newBoard,
      turn: newTurn,
    });

    const newWinner = checkWinnerFrom(newBoard);
    if (newWinner) {
      confetti();
      return setWinner(newWinner);
    } else if (checkEndGame(newBoard)) {
      return setWinner(false);
    }

    setIsMachineTurn(true);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setTurn(selectedPlayer);
    setWinner(null);

    // Borrar partida
    resetGameStorage();
  };

  const selectGameMode = (mode) => {
    if (mode === GAME_MODE.MACHINE) {
      setGameMode(GAME_MODE.MACHINE);
      setBoard(Array(9).fill(null));
    } else if (mode === GAME_MODE.TWO_PLAYER) {
      setGameMode(GAME_MODE.TWO_PLAYER);
      setBoard(Array(9).fill(null));
    }

    setMenu(false);
  };

  useEffect(() => {
    if (gameMode === GAME_MODE.MACHINE && isMachineTurn) {
      const player = selectedPlayer;
      const machine = player === TURNS.X ? TURNS.O : TURNS.X;

      const emptyCells = board.reduce((acc, cell, idx) => {
        if (cell === null) {
          acc.push(idx);
        }
        return acc;
      }, []);

      if (emptyCells.length > 0) {
        // Encuentra la posición de la última jugada de "X"
        const lastXPosition = board.indexOf(player);

        // Calcula la distancia de cada celda vacía a la última jugada de "X"
        const distances = emptyCells.map((emptyCell) => {
          const row1 = Math.floor(lastXPosition / 3);
          const col1 = lastXPosition % 3;
          const row2 = Math.floor(emptyCell / 3);
          const col2 = emptyCell % 3;
          return Math.abs(row1 - row2) + Math.abs(col1 - col2);
        });

        // Encuentra la celda vacía más cercana a la última jugada de "X"
        const closestEmptyCellIndex =
          emptyCells[distances.indexOf(Math.min(...distances))];

        // Simula el retraso de 1 segundo antes de que la máquina juegue
        const delay = 1000; // 1000 milisegundos (1 segundo)
        setTimeout(() => {
          const newBoard = [...board];
          newBoard[closestEmptyCellIndex] = machine;
          setBoard(newBoard);
          setTurn(player);
          setIsMachineTurn(false); // Establece el turno de la máquina como falso
          // Guardar partida nuevamente después de la jugada de "0"
          saveGameStorage({
            board: newBoard,
            turn: player,
          });
        }, delay);
      }
    }
  }, [board, gameMode, isMachineTurn, selectedPlayer]);

  return (
    <main className="board">
      <h1>Tres en raya</h1>

      <div>
        <button onClick={resetGame}>
          <RefreshIcon />
        </button>
        <button onClick={() => setMenu(!menu)}>
          <SettingsIcon />
        </button>
      </div>

      {/* Seccion para el juego */}
      <section className="game">
        {board.map((cell, index) => {
          return (
            <Square key={index} index={index} updateBoard={updateBoard}>
              {board[index]}
            </Square>
          );
        })}
      </section>

      {/* Seccion para los turnos */}
      <section className="turn">
        <Square isSelected={turn === TURNS.X}>{TURNS.X}</Square>
        <Square isSelected={turn === TURNS.O}>{TURNS.O}</Square>
      </section>

      {/* Seccion para el ganador */}
      <section>
        {winner !== null && (
          <WinnerModal winner={winner} resetGame={resetGame} />
        )}
      </section>

      {/* Seccion para el menu */}
      <section>
        {menu === true && (
          <MenuModal
            selectGameMode={selectGameMode}
            handlePlayerSelect={handlePlayerSelect}
          />
        )}
      </section>

      <footer
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          margin: "10px",
        }}
      >
        <h5>Version 2.0</h5>
      </footer>
    </main>
  );
}

export default App;
