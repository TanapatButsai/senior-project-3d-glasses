import React from "react";

const Button = ({ onClick, label, style }) => (
  <button
    onClick={onClick}
    style={{
      padding: "15px 40px",
      backgroundColor: "#1DB954",
      color: "#000",
      border: "none",
      borderRadius: "50px",
      cursor: "pointer",
      fontSize: "18px",
      fontWeight: "600",
      transition: "all 0.3s ease",
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
      ...style,
    }}
    onMouseOver={(e) => (e.target.style.backgroundColor = "#17a74a")}
    onMouseOut={(e) => (e.target.style.backgroundColor = "#1DB954")}
  >
    {label}
  </button>
);

export default Button;
