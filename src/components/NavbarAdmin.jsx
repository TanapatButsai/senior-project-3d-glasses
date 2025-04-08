import React from "react";
import { useNavigate } from "react-router-dom";
import "./NavbarAdmin.css"; // ใช้ไฟล์ CSS เดิม
import logoImage from "../assets/icon-192x192.png"; // โลโก้

const NavbarAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    navigate("/"); // ✅ กลับไปหน้าหลักหลัง logout
  };

  return (
    <header className="navbar">
      <div className="logo-wrapper" onClick={() => navigate("/admin")}>
        <img src={logoImage} alt="Logo" className="logo-image" />
        <h1 className="logo-text">VirtualTryOn</h1>
      </div>

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
          <li onClick={handleLogout} className="logout-button">
            Logout
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default NavbarAdmin;
