import { useMemo, useState, useEffect } from "react";
import { Chess } from "chess.js";
import Engine from "../engine.ts";
import GameOverModal from "../components/GameOverModal.jsx";
import { Chessboard } from "react-chessboard";
import "./Game.css";

function Game() {
  const levels = {
    easy: 1,
    medium: 5,
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

  const [optionSquares, setOptionSquares] = useState({});
  const [moveFrom, setMoveFrom] = useState("");
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveTo, setMoveTo] = useState(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [moveSquares, setMoveSquares] = useState({});

  const [captures, setCaptures] = useState([]);
  const [allCaptures, setAllCaptures] = useState([]);

  useEffect(() => {
    const currentMoves = game
      .history({ verbose: true })
      .map(
        (move) =>
          `${move.piece === "p" ? "" : move.piece.toUpperCase()}${move.from}${
            move.to
          }`
      );
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

  function getCaptures(capture) {
    setCaptures((prevCaptures) => [...prevCaptures, capture]);
    setAllCaptures((prevCaptures) => [...prevCaptures, capture]);
  }

  function onSquareRightClick(square) {
    const colour = "rgba(0, 0, 255, 0.4)";
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] &&
        rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    });
  }

  function getMoveOptions(square) {
    const moves = game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to).color !== game.get(square).color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move;
    });
    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick(square) {
    setRightClickedSquares({});

    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    if (!moveTo) {
      const moves = game.moves({
        moveFrom,
        verbose: true,
      });
      const foundMove = moves.find(
        (m) => m.from === moveFrom && m.to === square
      );
      if (!foundMove) {
        const hasMoveOptions = getMoveOptions(square);
        setMoveFrom(hasMoveOptions ? square : "");
        return;
      }

      setMoveTo(square);

      if (
        (foundMove.color === "w" &&
          foundMove.piece === "p" &&
          square[1] === "8") ||
        (foundMove.color === "b" &&
          foundMove.piece === "p" &&
          square[1] === "1")
      ) {
        setShowPromotionDialog(true);
        return;
      }

      const move = game.move({
        from: moveFrom,
        to: square,
        promotion: "q",
      });

      const capturedPiece = move.captured;
      if (capturedPiece) {
        const color = Piece === "white" ? "b" : "w";
        const capture = `${color + capturedPiece.toUpperCase()} at ${move.to}`;
        console.log(capture);
        getCaptures(capture);
      }

      if (move === null) {
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) setMoveFrom(square);
        return;
      }

      if (move) {
        setGamePosition(game.fen());
        setTimeout(findBestMove, 300);
        checkGameOver();
      }

      setMoveFrom("");
      setMoveTo(null);
      setOptionSquares({});
      return;
    }
  }

  function onPromotionPieceSelect(piece) {
    if (piece) {
      const move = game.move({
        from: moveFrom,
        to: moveTo,
        promotion: piece[1].toLowerCase() ?? "q",
      });

      if (move) {
        setGamePosition(game.fen());
        checkGameOver();
      }
    }

    setMoveFrom("");
    setMoveTo(null);
    setShowPromotionDialog(false);
    setOptionSquares({});
    setTimeout(findBestMove(), 300);
    return true;
  }

  function findBestMove() {
    engine.evaluatePosition(game.fen(), stockfishLevel);
    engine.onMessage(({ bestMove }) => {
      if (bestMove) {
        const move = game.move({
          from: bestMove.substring(0, 2),
          to: bestMove.substring(2, 4),
          promotion: bestMove.substring(4, 5),
        });

        setGamePosition(game.fen());

        if (move) {
          checkGameOver();

          const capturedPiece = move.captured;
          if (capturedPiece) {
            const color = Piece === "white" ? "w" : "b";
            const capture = `${color + capturedPiece.toUpperCase()} at ${
              move.to
            }`;
            console.log(capture);
            getCaptures(capture);
          }
        }
      }
    });
  }

  function onDrop(sourceSquare, targetSquare, piece) {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1].toLowerCase() ?? "q",
    });

    if ( move &&
      ((move.color === "w" && move.piece === "p" && targetSquare[1] === "8") ||
      (move.color === "b" && move.piece === "p" && targetSquare[1] === "1"))
    ) {
      setShowPromotionDialog(true);
      return;
    }
    
    setGamePosition(game.fen());

    if (!move) {
      console.log("Invalid move");
      return false;
    }

    const capturedPiece = move.captured;
    if (capturedPiece) {
      const color = Piece === "white" ? "b" : "w";
      const capture = `${color + capturedPiece.toUpperCase()} at ${move.to}`;
      console.log(capture);
      getCaptures(capture);
    }

    checkGameOver();
    setTimeout(findBestMove, 300);
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
    setCaptures([]);
    setAllCaptures([]);
    setMoves([]);
    const selectedPiece = Piece || "white";

    if (selectedPiece === "black") {
      findBestMove();
    } else {
      setGamePosition(game.fen());
    }
  }

  function beginDrag(piece, sourceSquare) {
    getMoveOptions(sourceSquare);
  }

  function endDrag(piece, sourceSquare) {
    getMoveOptions(null);
  }

  function handleUndo() {
    if (!isGameOver) {
      const lastMove = game.undo();
      if (lastMove && lastMove.captured) {
        const lastCapture = allCaptures.pop();
        setCaptures((prevCaptures) =>
          prevCaptures.filter((capture) => capture !== lastCapture)
        );
      }
      const playerMove = game.undo();
      if (playerMove && playerMove.captured) {
        const lastCapture = allCaptures.pop();
        setCaptures((prevCaptures) =>
          prevCaptures.filter((capture) => capture !== lastCapture)
        );
      }
      setGamePosition(game.fen());
      setMoveSquares({});
      setOptionSquares({});
      setRightClickedSquares({});
    } else {
      alert("Game over cannot undo");
    }
  }

  return (
    <div className="flex overflow-auto items-center justify-center h-screen bg-slate-800">
      <div className="p-2 overflow-auto max-w-screen-lg w-full">
        <div className="flex justify-center mb-2">
          {Object.entries(levels).map(([level, depth]) => (
            <button
              className="px-4 py-1 text-black rounded m-2"
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
          <div
            className="bg-gray-600 text-white overflow-auto rounded-md flex-col"
            id="captureArea"
          >
            <h2 className="font-bold mb-2 text-center">Captures:</h2>
            <div id="capul" className="flex justify-center">
              <ul className="text-left text-sm font-medium" id="capLog">
                {captures.map((capture, index) => (
                  <li key={index}>
                    {index + 1 + ". "}
                    {capture}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={boardWrapperStyle}>
            <Chessboard
              id="Chessboard"
              animationDuration={200}
              position={gamePosition}
              onPieceDragEnd={endDrag}
              onPieceDragBegin={beginDrag}
              onSquareClick={onSquareClick}
              onSquareRightClick={onSquareRightClick}
              onPieceDrop={onDrop}
              boardOrientation={Piece === "black" ? "black" : "white"}
              promotionToSquare={moveTo}
              showPromotionDialog={showPromotionDialog}
              onPromotionPieceSelect={onPromotionPieceSelect}
              customSquareStyles={{
                ...moveSquares,
                ...optionSquares,
                ...rightClickedSquares,
              }}
              customBoardStyle={{
                borderRadius: "4px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              }}
            />
          </div>

          <div
            className="overflow-auto ml-6 px-4 py-1 bg-gray-900 flex-col rounded-md"
            id="movesArea"
          >
            <h2 className="text-white font-bold mb-2 text-center">Moves:</h2>
            <div id="moveul">
              <ul className="text-white text-left w-full" id="moveLog">
                {moves.map((move, index) => (
                  <li
                    key={index}
                    className="font-medium text-sm text-left"
                    id="moveElement"
                  >
                    {index % 2 === 0 ? index / 2 + 1 + ". " : ""}
                    {move}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {isGameOver && <GameOverModal winner={winner} />}

        <div
          className="flex justify-center items-center gap-4"
          id="low-buttons"
        >
          <div>
            <select
              value={Piece}
              onChange={(e) => setPiece(e.target.value)}
              className=" text-white py-1 px-1 rounded bg-green-700 hover:bg-green-900"
            >
              <option value="white">White</option>
              <option value="black">Black</option>
            </select>
          </div>

          <div>
            <button
              className="px-2 py-1 bg-green-700 text-white rounded hover:bg-green-900"
              onClick={() => handleNewGame()}
            >
              New game
            </button>
          </div>

          <div>
            <button
              className="px-2 py-1 bg-green-700 text-white rounded hover:bg-green-900"
              onClick={() => {
                handleUndo();
              }}
            >
              Undo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Game;
