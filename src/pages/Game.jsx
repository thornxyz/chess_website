import { useMemo, useState, useEffect } from "react";
import { Chess } from "chess.js";
import Engine from "../engine.ts";
import GameOverModal from "../components/GameOverModal.jsx";
import ChessBoard from "../components/ChessBoard.jsx";

function Game() {
  const [Piece, setPiece] = useState("white");

  const levels = {
    easy: 1,
    medium: 4,
    hard: 18,
  };
  const engine = useMemo(() => new Engine(), []);
  const game = useMemo(() => new Chess(), []);

  const [gamePosition, setGamePosition] = useState(game.fen());
  const [stockfishLevel, setStockfishLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [moves, setMoves] = useState([]);

  function updateMoves(move) {
    console.log("Move object:", move);
    setMoves((prevMoves) => [...prevMoves, move]);
  }

  useEffect(() => {
    console.log(`Selected piece: ${Piece}`);
    handleNewGame();
    if (Piece === "black") {
      findBestMove();
    } else {
      setGamePosition(game.fen());
    }
  }, [Piece]);

  function findBestMove() {
    engine.evaluatePosition(game.fen(), stockfishLevel);

    engine.onMessage(({ bestMove }) => {
      if (bestMove) {
        game.move({
          from: bestMove.substring(0, 2),
          to: bestMove.substring(2, 4),
          promotion: bestMove.substring(4, 5),
        });

        setGamePosition(game.fen());
        updateMoves(bestMove);
        checkGameOver();
      }
    });
  }

  function onDrop(sourceSquare, targetSquare, piece) {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1].toLowerCase() ?? "q",
    });
    setGamePosition(game.fen());

    if (move === null) return false;

    checkGameOver();
    updateMoves(move.lan);
    findBestMove();

    return true;
  }

  function checkGameOver() {
    if (game.isGameOver() || game.isDraw()) {
      setIsGameOver(true);
      setWinner(
        game.isDraw() ? "Draw" : game.turn() === "w" ? "Black" : "White"
      );
    }
  }

  function handleNewGame() {
    setIsGameOver(false);
    setWinner(null);
    game.reset();
    setMoves([]);
    const selectedPiece = Piece || "white";

    if (selectedPiece === "black") {
      findBestMove();
    } else {
      setGamePosition(game.fen());
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-slate-800">
      <div className="p-2 overflow-auto max-w-screen-lg w-full">
        <div className="flex justify-center mb-2">
          {Object.entries(levels).map(([level, depth]) => (
            <button
              className="px-4 py-2 text-black rounded m-2"
              key={level}
              style={{
                backgroundColor:
                  depth === stockfishLevel ? "#B58863" : "#f0d9b5",
              }}
              onClick={() => setStockfishLevel(depth)}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="flex">
          <ChessBoard
            gamePosition={gamePosition}
            Piece={Piece}
            onDrop={onDrop}
          />

          <div
            className="ml-4 px-4"
            style={{ maxHeight: "70vh", overflowY: "auto" }}
          >
            <h2 className="text-white font-bold mb-2">Moves:</h2>
            <ul className="text-white">
              {moves.map((move, index) => (
                <li key={index}>{move}</li>
              ))}
            </ul>
          </div>
        </div>

        {isGameOver && <GameOverModal winner={winner} />}

        <div className="flex justify-center mt-2 space-x-4">
          <select
            value={Piece}
            onChange={(e) => setPiece(e.target.value)}
            className="py-2 text-white rounded my-1 bg-green-700 hover:bg-green-900"
          >
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>

          <button
            className="px-4 bg-green-700 text-white rounded hover:bg-green-900"
            onClick={() => handleNewGame()}
          >
            New game
          </button>

          <button
            className="px-4 bg-green-700 text-white rounded hover:bg-green-900"
            onClick={() => {
              game.undo();
              game.undo();
              setGamePosition(game.fen());
            }}
          >
            Undo
          </button>
        </div>
      </div>
    </div>
  );
}

export default Game;
