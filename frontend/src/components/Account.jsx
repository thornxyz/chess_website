import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

function Account() {
  const { username } = useParams();
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}getAllGames`, { username });
        setGames(response.data);
      } catch (error) {
        console.error('Error fetching games:', error);
        setGames([]);
      }
    };

    fetchGames();
  }, [username]);

  return (
    <div>
      <h2>Welcome, {username}</h2>
      <h3>Games:</h3>
      <pre>{JSON.stringify(games, null, 1)}</pre>
    </div>
  );
}

export default Account;
