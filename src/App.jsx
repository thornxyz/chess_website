import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import Bots from "./Bot";

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [makeBotMove, setMakeBotMove] = useState(null);
  const [gameOutcome, setGameOutcome] = useState(null);

  useEffect(() => {
    if (game.turn() === "b" && makeBotMove) {
      makeBotMove(gamePosition).then((botMove) => {
        makeAMove(botMove.from, botMove.to);
      });
      setMakeBotMove(null);
    }
  }, [game, gamePosition, makeBotMove]);

  function makeAMove(from, to) {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move({ from, to, promotion: "q" });
    setGame(gameCopy);
    setGamePosition(gameCopy.fen());

    if (result !== null && gameCopy.isCheckmate()) {
      setGameOutcome("Checkmate!");
    } else if (result !== null && gameCopy.isDraw()) {
      setGameOutcome("It's a Draw!");
    } else if ( result !== null && gameCopy.isStalemate()) {
      setGameOutcome("It's a stalemate!");
    }
    
  }

  function onDrop(sourceSquare, targetSquare) {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    setGamePosition(game.fen());

    if (move === null) return false;

    if (game.isGameOver() || game.isDraw()) {
      setGameOutcome("It's a Draw!");
    }

    if (game.turn() === "b") {
      setMakeBotMove(Bots["nmrugg/stockfish (l:1,d:10)"]);
    }

    return true;
  }

  return (
    <div>
      <Chessboard
        boardWidth={450}
        position={gamePosition}
        onPieceDrop={onDrop}
      />
      {gameOutcome && (
        <div style={{ marginTop: "10px", fontSize: "18px" }}>{gameOutcome}</div>
      )}
    </div>
  );
}
