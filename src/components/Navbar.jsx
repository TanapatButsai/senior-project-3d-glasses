import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css"; // Import styles
import logoImage from "../assets/icon-192x192.png"; // Import your image

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="logo-container">
        <img src={logoImage} alt="Logo" className="logo-image" />
      </div>
      <h1 className="logo-text">Virtual Try On</h1>
      <nav>
        <ul className="nav-links">
          <li onClick={() => navigate("/login")} className="login-button">
            Login
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
