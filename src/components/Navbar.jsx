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
      <div className="logo-wrapper" onClick={() => navigate("/")}>
        <img src={logoImage} alt="Logo" className="logo-image" />
        <h1 className="logo-text">VirtualTryOn</h1>
      </div>
      <nav>
        <ul className="nav-links">
          {user ? (
            <>
              <li className="user-name">👤 Hello, {user}</li>
              <li>
                <button onClick={handleLogout} className="modern-logout-button">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <button onClick={() => navigate("/login")} className="modern-login-button">
                Login
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
