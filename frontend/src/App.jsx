import Register from "./components/Register";
import Home from "./components/Home";
import Login from "./components/Login";
import Account from "./components/Account";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account/:username" element={<Account />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
