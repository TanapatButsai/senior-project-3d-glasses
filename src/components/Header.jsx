import React from "react";

const Header = ({ title }) => (
  <div
    style={{
      backgroundColor: "#000", // Black background
      width: "100%", // Full width
      padding: "20px 0", // Vertical padding for spacing
      boxSizing: "border-box", // Ensures padding doesn't affect width
      position: "fixed", // Sticks the header to the top of the page
      top: 0, // Aligns it to the very top
      zIndex: 1000, // Ensures it stays on top of other elements
    }}
  >
    <h1
      style={{
        color: "#fff", // White text for contrast
        fontSize: "24px", // Smaller font size for better fit
        fontWeight: "bold",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        margin: 0, // Remove default margin
      }}
    >
      {title}
    </h1>
  </div>
);

export default Header;

