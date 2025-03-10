import React from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ title }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // ลบ token ออกจาก localStorage
    navigate("/"); // กลับไปหน้า Login
  };

  return (
    <div
      style={{
        backgroundColor: "#000",
        width: "100%",
        padding: "20px 0",
        boxSizing: "border-box",
        position: "fixed",
        top: 0,
        zIndex: 1000,
      }}
    >
      <h1
        style={{
          color: "#fff",
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          margin: 0,
        }}
      >
        {title}
      </h1>
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          right: "20px",
          top: "10px",
          backgroundColor: "red",
          color: "#fff",
          padding: "10px 15px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Header;
