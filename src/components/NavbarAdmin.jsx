import React from "react";
import { useNavigate } from "react-router-dom";
import "./NavbarAdmin.css"; // ใช้ไฟล์ CSS เดิม
import logoImage from "../assets/icon-192x192.png"; // โลโก้

const NavbarAdmin = () => {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      {/* ✅ Logo */}
      <div className="logo-container">
        <img src={logoImage} alt="Logo" className="logo-image" />
      </div>
      <h1 className="logo-text">Admin Dashboard</h1>

      {/* ✅ Navigation Links */}
      <nav>
        <ul className="nav-links">
          <li onClick={() => navigate("/admin")} className="nav-button">
            Dashboard
          </li>
          <li onClick={() => navigate("/manage-models")} className="nav-button">
            Manage Models
          </li>
          <li onClick={() => navigate("/upload-model")} className="nav-button">
            Upload Model
          </li>
          <li onClick={() => navigate("/manage-users")} className="nav-button">
            Manage Users
          </li>
          <li onClick={() => navigate("/login")} className="logout-button">
            Logout
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default NavbarAdmin;
