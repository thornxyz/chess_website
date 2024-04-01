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

function Account() {
  const { username } = useParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="h-screen bg-slate-800 text-white">Loading...</div>;
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
        <div className="font-medium pt-1">Welcome, {username}</div>
      </div>
      {isnotEmpty(games) ? (
        <div className="overflow-x-auto mt-4">
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Winner</th>
                <th className="px-4 py-2 border">Game</th>
              </tr>
            </thead>
            <tbody>
              {games.games.map((game, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2 w-1/6">
                    {new Date(
                      new Date(game.game_date).getTime() -
                        new Date(game.game_date).getTimezoneOffset() * 60000
                    ).toLocaleString()}
                  </td>
                  <td className="border px-4 py-2 w-1/12">{game.winner}</td>
                  <td className="border px-4 py-2 break-all">
                    <div>{game.game}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-32 font-medium text-2xl">No games played yet</div>
      )}
    </div>
  );
}

export default Account;
