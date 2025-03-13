import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css"; // Import styles
import logoImage from "../assets/icon-192x192.png"; // Import your image

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser);
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="logo-container" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <img src={logoImage} alt="Logo" className="logo-image" />
      </div>
      <h1 className="logo-text">Virtual Try On</h1>
      <nav>
        <ul className="nav-links">
          {user ? (
            <>
              <li className="user-name">👤 Hello, {user}</li>
              <li onClick={handleLogout} className="logout-button">Logout</li>
            </>
          ) : (
            <li onClick={() => navigate("/login")} className="login-button">Login</li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
