import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Game from "../pages/Game";

function Home() {
  const [auth, setAuth] = useState(false);
  const [username, setUsername] = useState("");
  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}`)
      .then((res) => {
        if (res.data.Status === "Success") {
          setAuth(true);
          setUsername(res.data.username);
        } else {
          setAuth(false);
        }
      })
      .then((err) => console.log(err));
  }, []);

  const handleLogout = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}logout`)
      .then(() => {
        location.reload(true);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="overflow-auto">
      {auth ? (
        <div>
          <div className="flex bg-slate-800 justify-between w-full pl-2 pr-2 pt-2 pb-1 items-center relative top-0">
            <div className="text-white font-medium text-lg">Hello {username} </div>
            <div>
              <Link
                to={`/account/${username}`}
                className="bg-stone-500 text-white px-2 py-1 rounded-md hover:bg-stone-600 mr-4"
              >
                Account
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-800 text-white px-2 py-1 rounded-md hover:bg-red-900"
              >
                Logout
              </button>
            </div>
          </div>
          <Game username={username}/>
        </div>
      ) : (
        <div>
          <div className="flex items-center w-full justify-center flex-col h-screen bg-slate-500">
            <h1 className="font-medium text-white text-4xl mb-16 text-center ">Login to continue</h1>
            <Link to="/login" className="bg-green-500 text-white px-6 py-3 font-medium text-3xl rounded-md hover:bg-green-800">
              Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;

