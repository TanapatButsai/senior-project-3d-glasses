import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Header from "../components/Header";

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleCameraClick = () => {
    navigate("/camera");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#000",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <Header title="Welcome to the 3D Glasses App" />
      <Button label="Open Camera" onClick={handleCameraClick} />
    </div>
  );
};

export default WelcomePage;
