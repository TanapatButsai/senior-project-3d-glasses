import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css"; // Import styles

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="nav-bar">
      <h1 className="logo">Virtual Try On</h1>
      <nav>
        <ul className="nav-links">
          <li>Eyeglasses</li>
          <li>Sunglasses</li>
          <li onClick={() => navigate("/")} className="login-button">
            Login
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
