import { WINNING_COMBINATIONS } from "../constants";

// Funcion para determinar el ganador
// Se hace un recorrido por todas las combinaciones ganadoras, en cada uno se determinar si la posicion del boar original es igual a la posicion de la combinacion
export const checkWinnerFrom = (boartToCheck) => {
  for (const combinations of WINNING_COMBINATIONS) {
    const [a, b, c] = combinations;
    if (
      boartToCheck[a] && // Si en la posicion hay un x u o
      boartToCheck[a] === boartToCheck[b] && // Si la primera posicion es igual a la segunda
      boartToCheck[a] === boartToCheck[c] // Si la primera posicion es igual a la tercera
    ) {
      return boartToCheck[a]; // Devuelve x u o
    }
  }
  return null;
};

export const checkEndGame = (newBoard) => {
  return newBoard.every((square) => square !== null);
};
