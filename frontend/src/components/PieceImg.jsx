
import wP from "/pieces/wP.png";
import wR from "/pieces/wR.png";
import wN from "/pieces/wN.png";
import wB from "/pieces/wB.png";
import wQ from "/pieces/wQ.png";
import wK from "/pieces/wK.png";
import bP from "/pieces/bP.png";
import bR from "/pieces/bR.png";
import bN from "/pieces/bN.png";
import bB from "/pieces/bB.png";
import bQ from "/pieces/bQ.png";
import bK from "/pieces/bK.png";

function PieceImage({ piece }) {
  const imageSize = "1.5rem"; 

  switch (piece) {
    case 'wP':
      return <img src={wP} alt="White Pawn" style={{ width: imageSize, height: imageSize }} />;
    case 'wR':
      return <img src={wR} alt="White Rook" style={{ width: imageSize, height: imageSize }} />;
    case 'wN':
      return <img src={wN} alt="White Knight" style={{ width: imageSize, height: imageSize }} />;
    case 'wB':
      return <img src={wB} alt="White Bishop" style={{ width: imageSize, height: imageSize }} />;
    case 'wQ':
      return <img src={wQ} alt="White Queen" style={{ width: imageSize, height: imageSize }} />;
    case 'wK':
      return <img src={wK} alt="White King" style={{ width: imageSize, height: imageSize }} />;
    case 'bP':
      return <img src={bP} alt="Black Pawn" style={{ width: imageSize, height: imageSize }} />;
    case 'bR':
      return <img src={bR} alt="Black Rook" style={{ width: imageSize, height: imageSize }} />;
    case 'bN':
      return <img src={bN} alt="Black Knight" style={{ width: imageSize, height: imageSize }} />;
    case 'bB':
      return <img src={bB} alt="Black Bishop" style={{ width: imageSize, height: imageSize }} />;
    case 'bQ':
      return <img src={bQ} alt="Black Queen" style={{ width: imageSize, height: imageSize }} />;
    case 'bK':
      return <img src={bK} alt="Black King" style={{ width: imageSize, height: imageSize }} />;
    default:
      return null;
  }
}

export default PieceImage;
