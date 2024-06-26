import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function isnotEmpty(obj) {
  const regex = /\[\]/;
  if (regex.test(JSON.stringify(obj))) {
    return false;
  }
  return true;
}

function getTime(date) {
  const timestamp = new Date(date).getTime();

  const offsetMilliseconds = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
  const adjustedTimestamp = timestamp + offsetMilliseconds;

  return new Date(adjustedTimestamp).toLocaleString();
}

function Account() {
  const { username } = useParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doj, setDoj] = useState();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}getAllGames`,
          { username }
        );
        setGames(response.data);
      } catch (error) {
        console.error("Error fetching games:", error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [username]);

  useEffect(() => {
    const getDoj = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}getDoj`,
          { username }
        );
        const dateString = new Date(response.data.doj[0].doj);
        setDoj(dateString.toLocaleDateString());
        console.log(doj);
      } catch (error) {
        console.error("Error fetching doj:", error);
        setDoj([]);
      }
    };
    getDoj();
  }, [username]);

  if (loading) {
    return (
      <div className="h-screen bg-slate-800 text-white text-center py-20">
        Loading...
      </div>
    );
  }

  return (
    <div className="pr-1 pl-1 pb-4 min-h-screen bg-slate-800 text-white">
      <div className="flex justify-between items-center pt-2 px-2">
        <Link
          to="/"
          className="bg-stone-500 text-white px-2 py-1 rounded-md hover:bg-stone-600"
        >
          Back to Game
        </Link>
        <div className="font-medium pt-1">
          Welcome, {username}
          <div>Joined on: {doj}</div>
        </div>
      </div>
      {isnotEmpty(games) ? (
        <div className="overflow-x-auto mt-4">
          <table className="table-auto w-full border-collapse bg-gray-600">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Winner</th>
                <th className="px-4 py-2 border">Player</th>
                <th className="px-4 py-2 border">Game</th>
              </tr>
            </thead>
            <tbody className="text-sm font-mono">
              {games.games.map((game, index) => (
                <tr key={index}>
                  <td className="border px-2 py-2 w-1/6">
                    {getTime(game.game_date)}
                  </td>
                  <td className="border px-2 py-2 w-1/12">{game.winner}</td>
                  <td className="border px-2 py-2 w-1/12">
                    {game.player_colour}
                  </td>
                  <td className="border px-2 py-2 break-all">
                    <div>{game.game}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-32 font-medium text-2xl">
          No games played yet
        </div>
      )}
    </div>
  );
}

export default Account;
