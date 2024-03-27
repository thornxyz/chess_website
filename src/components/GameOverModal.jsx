import { useState } from "react";
import PropTypes from "prop-types";

const boxStyles = {
  base: "border-2 border-solid border-white border-opacity-25 rounded-xl font-bold m-2 p-3 hover:bg-opacity-80 bg-slate-900 bg-opacity-80 shadow-box h-35 w-60 text-white text-center",
};

function GameOverModal({ winner, onClose }) {
  const [modalVisible, setModalVisible] = useState(true);

  const handleOkClick = () => {
    setModalVisible(false);
    onClose();
  };

  if (!modalVisible) {
    return null;
  }

  return (
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${boxStyles.base}`}
    >
      <p className="mb-4 text-2xl font-bold">Game Over!</p>
      <p className="mb-4">Winner: {winner}</p>
      <button
        className="px-4 py-2 bg-lime-500 text-black rounded hover:bg-lime-600 hover:text-white"
        onClick={handleOkClick}
      >
        Ok
      </button>
    </div>
  );
}

GameOverModal.propTypes = {
  winner: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default GameOverModal;
