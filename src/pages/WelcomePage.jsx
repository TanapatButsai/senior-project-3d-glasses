import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Header from "../components/Header";
import Footer from "../components/Footer";

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleCameraClick = () => {
    navigate("/camera");
  };

  const handleModelViewerClick = () => {
    navigate("/model-viewer");
  };

  const handleModelUploadClick = () => {
    navigate("/model-upload");
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
        backgroundColor: "#326a72", // Updated background color
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <Header title="3D Glasses Try-on App" />
      
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px", // Adds spacing between buttons
          marginTop: "20px", // Adds spacing between header and buttons
        }}
      >
        <Button label="Open Camera" onClick={handleCameraClick} />
        <Button label="Model Viewer" onClick={handleModelViewerClick} />
        <Button label="Model Upload" onClick={handleModelUploadClick} />
      </div>

      <Footer />
    </div>
  );
};

export default WelcomePage;

