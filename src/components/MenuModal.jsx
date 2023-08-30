import { GAME_MODE, TURNS } from "../constants";
import { MachinePlayerIcon } from "../icons/MachinePlayerIcon";
import { TwoPlayerIcon } from "../icons/TwoPlayersIcon";
import XIcon from "../icons/XIcon";

export const MenuModal = ({ selectGameMode, handlePlayerSelect, exitMenu }) => {
  return (
    <section>
      <section className="menu">
        <div className="text">
          <div style={{ position: "relative" }}>
            <button
              className="exit"
              style={{ position: "absolute", top: 0, right: 0 }}
              onClick={exitMenu}
            >
              <XIcon />
            </button>
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
        </div>
      </section>
    </section>
  );
};
