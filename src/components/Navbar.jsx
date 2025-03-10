import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css"; // Import styles

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="navbar"> {/* ✅ Change className from "nav-bar" to "navbar" */}
      <h1 className="logo">Virtual Try On</h1>
      <nav>
        <ul className="nav-links">
          <li onClick={() => navigate("/")} className="login-button">
            Login
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
