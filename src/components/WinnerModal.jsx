import { RefreshIcon } from "../icons/RefreshIcon.jsx";
import { SwipeIcon } from "../icons/SwipeIcon.jsx";
import { Square } from "./Square.jsx";

export const WinnerModal = ({ winner, resetGame }) => {
  if (winner == null) return;

  const winnerText = winner === false ? "Empate" : "Gano:";

  return (
    <section>
      <section className="winner">
        <div className="text">
          <h2>{winnerText}</h2>

          <header className={winner ? "win" : ""}>
            {winner === false ? (
              <SwipeIcon width="50" height="50" />
            ) : (
              <Square>{winner}</Square>
            )}
          </header>

          <footer>
            <button onClick={resetGame}>
              <RefreshIcon />
            </button>
          </footer>
        </div>
      </section>
    </section>
  );
};
