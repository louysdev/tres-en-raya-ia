import { useState } from "react";
import confetti from "canvas-confetti";
import { Square } from "./components/Square";
import { TURNS, WINNING_COMBINATIONS, GAME_MODE } from "./constants";
import { checkWinnerFrom, checkEndGame } from "./logic/board";
import { WinnerModal } from "./components/WinnerModal";
import { resetGameStorage, saveGameStorage } from "./logic/storage/index";
import "./App.css";

function App() {
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

  const handlePlayerSelect = (player) => {
    console.log("use");
    setSelectedPlayer(player);
    setTurn(player);
    setBoard(Array(9).fill(null)); // Reinicia el tablero cuando se cambia de jugador
    console.log(gameMode);
    console.log(player);
  };

  const updateBoard = (index) => {
    if (board[index] !== null || winner) return;

    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);

    const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X;
    setTurn(newTurn);

    if (
      (newTurn === TURNS.O || newTurn === TURNS.X) &&
      gameMode === GAME_MODE.MACHINE
    ) {
      const player = selectedPlayer === TURNS.X ? TURNS.X : TURNS.O;
      const machine = player === TURNS.X ? TURNS.O : TURNS.X;

      const emptyCells = newBoard.reduce((acc, cell, idx) => {
        if (cell === null) {
          acc.push(idx);
        }
        return acc;
      }, []);

      if (emptyCells.length > 0) {
        // Encuentra la posición de la última jugada de "X"
        const lastXPosition = newBoard.indexOf(player);

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

        // Realiza la jugada de "0" en la celda más cercana
        newBoard[closestEmptyCellIndex] = machine;
        setBoard(newBoard);
        setTurn(player);
      }
    }

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
  };

  return (
    <main className="board">
      <h1>Tres en raya</h1>
      <button onClick={resetGame}>Reiniciar juego</button>

      <div>
        <button onClick={() => selectGameMode(GAME_MODE.MACHINE)}>
          Contra la maquina
        </button>
        <button onClick={() => selectGameMode(GAME_MODE.TWO_PLAYER)}>
          Dos jugadores
        </button>
      </div>

      {/* Seccion para seleccionar jugador */}
      <div>
        <button onClick={() => handlePlayerSelect(TURNS.X)}>
          Jugar como X
        </button>
        <button onClick={() => handlePlayerSelect(TURNS.O)}>
          Jugar como O
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
          <section className="winner">
            <div className="text">
              <h2>{winner === false ? "Empate" : `Gano:`}</h2>

              <header className="win">
                {winner && <Square>{winner}</Square>}
              </header>

              <footer>
                <button onClick={resetGame}>Empezar de nuevo</button>
              </footer>
            </div>
          </section>
        )}
      </section>

      {/* Seccion del modal del ganador */}
      <WinnerModal winner={winner} resetGame={resetGame} />
    </main>
  );
}

export default App;
