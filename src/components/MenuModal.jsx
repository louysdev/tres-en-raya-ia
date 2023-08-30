import { GAME_MODE, TURNS } from "../constants";
import { MachinePlayerIcon } from "../icons/MachinePlayerIcon";
import { TwoPlayerIcon } from "../icons/TwoPlayersIcon";

export const MenuModal = ({ selectGameMode, handlePlayerSelect }) => {
  return (
    <section>
      <section className="menu">
        <div className="text">
          <h2>Modos de juego</h2>
          <div>
            <button onClick={() => selectGameMode(GAME_MODE.MACHINE)}>
              <MachinePlayerIcon />
            </button>
            <button onClick={() => selectGameMode(GAME_MODE.TWO_PLAYER)}>
              <TwoPlayerIcon />
            </button>
          </div>

          <h2>Jugadores</h2>
          {/* Seccion para seleccionar jugador */}
          <div>
            <button
              style={{ fontSize: "20px" }}
              onClick={() => handlePlayerSelect(TURNS.X)}
            >
              {TURNS.X}
            </button>
            <button
              style={{ fontSize: "20px" }}
              onClick={() => handlePlayerSelect(TURNS.O)}
            >
              {TURNS.O}
            </button>
          </div>
        </div>
      </section>
    </section>
  );
};
