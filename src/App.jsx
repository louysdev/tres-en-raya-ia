import { useState } from "react";
import confetti from "canvas-confetti";
import { Square } from "./components/Square";
import { TURNS, WINNING_COMBINATIONS } from "./constants";
import { checkWinnerFrom, checkEndGame } from "./logic/board";
import { WinnerModal } from "./components/WinnerModal";
import { resetGameStorage, saveGameStorage } from "./logic/storage/index";
import "./App.css";

function App() {
  // Manera correcta de insertar el localstorage en un estado
  const [board, setBoard] = useState(() => {
    const savedBoard = window.localStorage.getItem("board");
    return savedBoard ? JSON.parse(savedBoard) : Array(9).fill(null);
  });
  const [turn, setTurn] = useState(() => {
    const savedTurn = window.localStorage.getItem("turn");
    return savedTurn ? savedTurn : TURNS.X;
  });
  const [winner, setWinner] = useState(null); // null es que no hay ganador, false hay un empate

  const updateBoard = (index) => {
    if (board[index] || winner) return;

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

    // Revisar si hay un ganador
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
    setTurn(TURNS.X);
    setWinner(null);

    // Borrar partida
    resetGameStorage();
  };

  return (
    <main className="board">
      <h1>Tres en raya</h1>
      <button onClick={resetGame}>Reiniciar juego</button>
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
