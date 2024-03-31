import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";

const boxStyles = {
  base: "border-2 border-solid border-white border-opacity-25 rounded-xl font-bold m-2 p-3 hover:bg-opacity-80 bg-slate-900 bg-opacity-80 shadow-box h-35 w-60 text-white text-center",
};

function GameOverModal({ winner, username, game }) {
  const [modalVisible, setModalVisible] = useState(true);
  const [buttonClicked, setButtonClicked] = useState(false);

  const handleOkClick = async () => {
    if (buttonClicked) return;
    setButtonClicked(true);

    try {
      const currentDate = new Date().toISOString();

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}addChessGame`,
        {
          username: username,
          game_date: currentDate,
          winner: winner,
        }
      );

      const gameid = response.data.gameId;

      await axios.post(`${import.meta.env.VITE_API_URL}addGameData`, {
        gameId: gameid,
        gameData: game,
      });

      console.log(game);
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding chess game:", error);
    }
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
  username: PropTypes.string.isRequired,
  game: PropTypes.string.isRequired,
};

export default GameOverModal;
