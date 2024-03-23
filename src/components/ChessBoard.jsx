import { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';

const ChessBoard = ({ game, isWhiteTurn, onDrop, Piece, boardOrientation ,gamePosition}) => {
  const [boardWrapperStyle, setBoardWrapperStyle] = useState({
    width: '80vw',
    maxWidth: '80vh',
    margin: '1rem auto',
  });

  useEffect(() => {
    function handleResize() {
      const isSmallScreen = window.innerWidth <= 576;
      setBoardWrapperStyle({
        width: isSmallScreen ? '92vw' : '75vw',
        maxWidth: isSmallScreen ? '93vh' : '80vh',
        margin: '1rem auto',
      });
    }

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const combinedBoardOrientation = boardOrientation || (Piece ? (Piece === 'black' ? 'black' : 'white') : (isWhiteTurn ? 'white' : 'black'));
  
  return (
    <div className="flex justify-center" style={boardWrapperStyle}>
      <Chessboard
        id="Chessboard"
        position={gamePosition || game.fen()}
        onPieceDrop={onDrop}
        boardOrientation={combinedBoardOrientation}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}
      />
    </div>
  );
};

export default ChessBoard;
