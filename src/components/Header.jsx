import React from "react";

const Header = ({ title }) => (
  <h1
    style={{
      color: "#fff",
      fontSize: "36px",
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: "20px",
      fontFamily: "Arial, sans-serif",
    }}
  >
    {title}
  </h1>
);

export default Header;
