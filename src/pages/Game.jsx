import { useMemo, useState, useEffect } from "react";
import { Chess } from "chess.js";
import Engine from "../engine.ts";
import GameOverModal from "../components/GameOverModal.jsx";
import { Chessboard } from "react-chessboard";
import "./Game.css";

function Game() {
  const levels = {
    easy: 1,
    medium: 4,
    hard: 18,
  };

  const engine = useMemo(() => new Engine(), []);
  const game = useMemo(() => new Chess(), []);

  const [Piece, setPiece] = useState("white");
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [stockfishLevel, setStockfishLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [moves, setMoves] = useState([]);
  const [boardWrapperStyle, setBoardWrapperStyle] = useState({
    width: "70vw",
    maxWidth: "70vh",
  });

  useEffect(() => {
    const currentMoves = game
      .history({ verbose: true })
      .map((move) => `${move.from}${move.to}`);
    setMoves(currentMoves);
  }, [game.fen()]);

  useEffect(() => {
    console.log(`Selected piece: ${Piece}`);
    handleNewGame();
    if (Piece === "black") {
      findBestMove();
    } else {
      setGamePosition(game.fen());
    }
  }, [Piece]);

  useEffect(() => {
    function handleResize() {
      const isSmallScreen = window.innerWidth <= 576;
      setBoardWrapperStyle({
        width: isSmallScreen ? "92vw" : "70vw",
        maxWidth: isSmallScreen ? "93vh" : "70vh",
      });
    }
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

    if (!move) {
      console.log("Invalid move");
      return false;
    }

    checkGameOver();
    findBestMove();
    return true;
  }

  function checkGameOver() {
    if (game.game_over() || game.in_draw()) {
      setIsGameOver(true);
      setWinner(
        game.in_draw() ? "Draw" : game.turn() === "w" ? "Black" : "White"
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
    <div className="flex overflow-auto items-center justify-center h-screen bg-slate-800">
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

        <div className="w-full flex justify-center items-center" id="boardArea">
          <div style={boardWrapperStyle}>
            <Chessboard
              id="Chessboard"
              position={gamePosition}
              onPieceDrop={onDrop}
              boardOrientation={Piece === "black" ? "black" : "white"}
              customBoardStyle={{
                borderRadius: "4px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              }}
            />
          </div>

          <div
            className="overflow-auto ml-6 px-4 py-1 bg-gray-900 flex-col items-center justify-center rounded-md"
            id="movesArea"
          >
            <h2 className="text-white font-bold mb-2 text-center">Moves:</h2>
            <ul className="text-white text-left" id="moveLog">
              {moves.map((move, index) => (
                <li key={index} className="font-medium text-sm">
                  {index + 1}. {move}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {isGameOver && <GameOverModal winner={winner} />}

        <div className="flex justify-center mt-4 space-x-4">
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
