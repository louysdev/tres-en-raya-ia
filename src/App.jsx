import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Square } from "./components/Square";
import { TURNS, GAME_MODE, WINNING_COMBINATIONS } from "./constants";
import { checkWinnerFrom, checkEndGame } from "./logic/board";
import { WinnerModal } from "./components/WinnerModal";
import { resetGameStorage, saveGameStorage } from "./logic/storage/index";
import "./App.css";
import { MenuModal } from "./components/MenuModal";
import { RefreshIcon } from "./icons/RefreshIcon";
import { SettingsIcon } from "./icons/SettingsIcon";

function App() {
  const [isBlocked, setIsBlocked] = useState(false);
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

  const saveWinningMoves = (winningMoves) => {
    window.localStorage.setItem("winningMoves", JSON.stringify(winningMoves));
  };

  const getWinningMoves = () => {
    const savedWinningMoves = window.localStorage.getItem("winningMoves");
    return savedWinningMoves ? JSON.parse(savedWinningMoves) : [];
  };

  const updateBoard = (index) => {
    if (board[index] !== null || winner || (gameMode !== GAME_MODE.TWO_PLAYER && isBlocked)) return;

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
      setWinner(newWinner);
      if (newWinner === selectedPlayer) {
        const winningMoves = getWinningMoves();
        const isMoveAlreadySaved = winningMoves.some((savedMove) => JSON.stringify(savedMove) === JSON.stringify(board));
        if (!isMoveAlreadySaved) {
          winningMoves.push(board);
          saveWinningMoves(winningMoves);
        }
      }
    } else if (checkEndGame(newBoard)) {
      return setWinner(false);
    }

    if (gameMode !== GAME_MODE.TWO_PLAYER) {
      setIsBlocked(true);
      setIsMachineTurn(true);

      setTimeout(() => {
        setIsBlocked(false);
      }, 1000);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setTurn(selectedPlayer);
    setWinner(null);
    setIsBlocked(false);

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

  const exitMenu = () => {
    setMenu(false);
  };

  useEffect(() => {

    if (winner !== null) {
      return
    }

    if (gameMode === GAME_MODE.MACHINE && isMachineTurn) {
      const player = selectedPlayer;
      const machine = player === TURNS.X ? TURNS.O : TURNS.X;

      let move = null;

      // // Si no se encontró una jugada para ganar o bloquear al jugador, verifica las jugadas ganadoras del jugador
      if (move === null) {
        const winningMoves = getWinningMoves();
        console.log(winningMoves);

        let maxSimilarity = 0;
        let mostSimilarMove = null;

        // Recorre las jugadas ganadoras del usuario
        for (let winningMove of winningMoves) {
          let similarity = 0;
          for (let i = 0; i < board.length; i++) {
            if (board[i] === player && winningMove[i] === player) {
              similarity++;
            }
          }
          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            mostSimilarMove = winningMove;
          }
        }

        // Si encontramos una jugada similar, hacemos la jugada que sigue en la jugada ganadora
        if (mostSimilarMove !== null) {
          for (let i = 0; i < board.length; i++) {
            if (board[i] === null && mostSimilarMove[i] === player) {
              move = i;
              break;
            }
          }
        }
      }

      // Recorre todas las combinaciones ganadoras
      for (let combination of WINNING_COMBINATIONS) {
        // Si la máquina tiene dos en una fila, juega la tercera para ganar
        if (board[combination[0]] === machine && board[combination[1]] === machine && board[combination[2]] === null) {
          move = combination[2];
          break;
        }
        if (board[combination[1]] === machine && board[combination[2]] === machine && board[combination[0]] === null) {
          move = combination[0];
          break;
        }
        if (board[combination[0]] === machine && board[combination[2]] === machine && board[combination[1]] === null) {
          move = combination[1];
          break;
        }

        // Si el jugador tiene dos en una fila, bloquea la tercera
        if (board[combination[0]] === player && board[combination[1]] === player && board[combination[2]] === null) {
          move = combination[2];
          break;
        }
        if (board[combination[1]] === player && board[combination[2]] === player && board[combination[0]] === null) {
          move = combination[0];
          break;
        }
        if (board[combination[0]] === player && board[combination[2]] === player && board[combination[1]] === null) {
          move = combination[1];
          break;
        }
      }

      // Si no se encontró una jugada para ganar o bloquear al jugador, juega aleatoriamente
      if (move === null) {
        const emptyCells = board.reduce((acc, cell, idx) => {
          if (cell === null) {
            acc.push(idx);
          }
          return acc;
        }, []);

        if (emptyCells.length > 0) {
          const lastPlayerPosition = board.indexOf(player);

          const distances = emptyCells.map((emptyCell) => {
            const row1 = Math.floor(lastPlayerPosition / 3);
            const col1 = lastPlayerPosition % 3;
            const row2 = Math.floor(emptyCell / 3);
            const col2 = emptyCell % 3;
            return Math.abs(row1 - row2) + Math.abs(col1 - col2);
          });

          move = emptyCells[distances.indexOf(Math.min(...distances))];
        }
      }

      if (move !== null) {
        const newBoard = [...board];
        newBoard[move] = machine;
      
        const delay = GAME_MODE.MACHINE ? 1000 : 0;
        setTimeout(() => {
          setBoard(newBoard);
          setTurn(player);
          setIsMachineTurn(false);
          saveGameStorage({
            board: newBoard,
            turn: player,
          });
          setIsBlocked(false);
      
          // Verificar si la máquina ha ganado después de su jugada
          const newWinner = checkWinnerFrom(newBoard);
          if (newWinner) {
            confetti();
            setWinner(newWinner);
          } else if (checkEndGame(newBoard)) {
            setWinner(false);
          }
        }, delay);
      }
    }
  }, [board, gameMode, isMachineTurn, selectedPlayer, winner]);

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
            <Square
              isBlocked={isBlocked}
              key={index}
              index={index}
              updateBoard={updateBoard}
            >
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
            exitMenu={exitMenu}
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
        <h5>Version 2.7</h5>
      </footer>
    </main>
  );
}

export default App;
