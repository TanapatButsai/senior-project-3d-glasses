import React from "react";
import { useNavigate } from "react-router-dom";
import "./NavbarAdmin.css"; // ใช้ไฟล์ CSS เดิม
import logoImage from "../assets/icon-192x192.png"; // โลโก้

const NavbarAdmin = () => {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      {/* ✅ Logo */}
      <div className="logo-wrapper" onClick={() => navigate("/admin")}>
        <img src={logoImage} alt="Logo" className="logo-image" />
        <h1 className="logo-text">VirtualTryOn</h1>
      </div>

      {/* ✅ Navigation Links */}
      <nav>
        <ul className="nav-links">
        <li onClick={() => navigate("/shop-admin")} className="nav-button">
            Try On Glasses
          </li>
          <li onClick={() => navigate("/model-management")} className="nav-button">
            Manage Models
          </li>
          <li onClick={() => navigate("/model-upload")} className="nav-button">
            Upload Model
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
