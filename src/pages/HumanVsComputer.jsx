import { useMemo, useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import Engine from "../engine.ts";
import GameOverModal from '../components/GameOverModal';
import ChessBoard from '../components/ChessBoard.jsx';


function HumanVsComputer() {

  const [Piece, setPiece] = useState('white');

  const levels = {
    "Easy (500)": 1,
    "Medium (1500)": 4,
    "Hard (2000)": 18,
  };
  const engine = useMemo(() => new Engine(), []);
  const game = useMemo(() => new Chess(), []);

  const [gamePosition, setGamePosition] = useState(game.fen());
  const [stockfishLevel, setStockfishLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    console.log(`Selected piece: ${Piece}`);
    handleNewGame();
    if (Piece === 'black') {
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
    findBestMove();

    return true;
  }

  function checkGameOver() {
    if (game.isGameOver() || game.isDraw()) {
      setIsGameOver(true);
      setWinner(game.isDraw() ? 'Draw' : game.turn() === 'w' ? 'Black' : 'White');
    }
  }

  function handleNewGame() {
    setIsGameOver(false);
    setWinner(null);
    game.reset();
    const selectedPiece = Piece || 'white';

    
    if (selectedPiece === 'black') {
      findBestMove(); 
    } else {
      setGamePosition(game.fen());
    } 
 }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-2 overflow-hidden max-w-screen-lg w-full">

        <div className='flex justify-center mb-2'>
        {Object.entries(levels).map(([level, depth]) => (
          <button
          className="px-4 py-2 text-white rounded m-2"
          key={level}
            style={{
              backgroundColor: depth === stockfishLevel ? "#B58863" : "#f0d9b5",
            }}
            onClick={() => setStockfishLevel(depth)}
          >
            {level}
          </button>
        ))}
        </div>
        <ChessBoard gamePosition={gamePosition} Piece={Piece} onDrop={onDrop} />

        {isGameOver && (
          <GameOverModal winner={winner} handleNewGame={handleNewGame} />
        )}
        <div className="flex justify-center mt-2 space-x-4">
        <select
            value={Piece}
            onChange={(e) => setPiece(e.target.value)}
            className="px-4 py-2 text-white rounded m-2 bg-blue-500"
          >
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleNewGame()}
          >
            New game
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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

export default HumanVsComputer;
