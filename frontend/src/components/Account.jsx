import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

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
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Welcome, {username}</h2>
      <h3>Games:</h3>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Winner</th>
              <th className="px-4 py-2">Game</th>
            </tr>
          </thead>
          <tbody>
            {games.games.map((game, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">
                  {new Date(game.game_date).toLocaleString()}
                </td>
                <td className="border px-4 py-2">{game.winner}</td>
                <td className="border px-4 py-2 break-all">
                  <div>{game.game}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Account;
