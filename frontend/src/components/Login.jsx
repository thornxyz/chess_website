import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Login() {

  const [values, setValues] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .post(`${import.meta.env.VITE_API_URL}login`, values)
      .then((res) => {
        if (res.data.Status === "Success") {
          navigate("/");
        } else {
          alert(res.data.Error);
        }
      })
      .then((err) => console.log(err));
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-400">
      <div className="bg-zinc-600 p-6 rounded-lg w-full max-w-sm m-4 flex flex-col items-center">
        <div className="font-semibold text-white py-1 mb-4 text-3xl">
          Login
        </div>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="text-white w-full font-medium text-xl">Username</div>
          <input
            type="text"
            placeholder="Enter Username"
            className="w-full py-2 px-2 my-1 rounded-sm"
            onChange={(e) => setValues({ ...values, username: e.target.value })}
          />
          <div className="mt-4 text-white w-full font-medium text-xl">
            Password
          </div>
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full py-2 px-2 my-1 rounded-sm mb-6"
            onChange={(e) => setValues({ ...values, password: e.target.value })}
          />
          <button
            type="submit"
            className="bg-blue-500 my-2 rounded-md w-full py-2 text-white font-medium text-lg hover:bg-blue-700"
          >
            Login
          </button>
          <Link
            to="/register"
            className="bg-gray-400 my-2 rounded-md w-full py-2 text-white font-medium text-lg hover:bg-gray-500 text-center mb-4 block"
          >
            Create Account
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Login;
