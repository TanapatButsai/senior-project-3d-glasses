import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const UploadPage = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#326a72",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <Header title="Upload 3D Glasses Model" />

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "50%",
          }}
        >
          <label
            htmlFor="modelName"
            style={{
              color: "#fff",
              fontSize: "18px",
              marginBottom: "10px",
              alignSelf: "flex-start",
            }}
          >
            Model Name:
          </label>
          <input
            type="text"
            id="modelName"
            placeholder="Enter Model Name"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "20px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

          <label
            htmlFor="fileUpload"
            style={{
              color: "#fff",
              fontSize: "18px",
              marginBottom: "10px",
              alignSelf: "flex-start",
            }}
          >
            Choose File:
          </label>
          <input
            type="file"
            id="fileUpload"
            style={{
              marginBottom: "20px",
            }}
          />

          <button
            type="submit"
            style={{
              backgroundColor: "#1DB954",
              color: "#fff",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Upload
          </button>
        </form>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UploadPage;

