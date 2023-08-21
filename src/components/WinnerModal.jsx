import { Square } from "./Square.jsx";

export const WinnerModal = ({ winner, resetGame }) => {
  if (winner == null) return;

  const winnerText = winner === false ? "Empate" : "Gano:";

  return (
    <section>
      <section className="winner">
        <div className="text">
          <h2>{winnerText}</h2>

          <header className="win">{winner && <Square>{winner}</Square>}</header>

          <footer>
            <button onClick={resetGame}>Empezar de nuevo</button>
          </footer>
        </div>
      </section>
    </section>
  );
};
