import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ModelUploadPage = () => {
  const [modelName, setModelName] = useState(""); // Store model name
  const [file, setFile] = useState(null); // Store uploaded file
  const [message, setMessage] = useState(""); // Display upload status

  const handleNameChange = (e) => {
    setModelName(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (!modelName || !file) {
      setMessage("⚠️ Please provide both a model name and a file.");
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("modelName", modelName);
    formData.append("file", file);

    try {
      // Send POST request
      const response = await fetch("http://localhost:5050/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("✅ Model uploaded successfully!");
        setModelName(""); // Reset form fields
        setFile(null);
      } else {
        setMessage(result.message || "❌ Failed to upload model.");
      }
    } catch (error) {
      console.error("Error uploading model:", error);
      setMessage("❌ An error occurred while uploading the model.");
    }
  };

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

      {/* Upload Form */}
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
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "50%",
            backgroundColor: "#1e474d",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Model Name Input */}
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
            value={modelName}
            onChange={handleNameChange}
            placeholder="Enter Model Name"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "20px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

          {/* File Upload Input */}
          <label
            htmlFor="fileUpload"
            style={{
              color: "#fff",
              fontSize: "18px",
              marginBottom: "10px",
              alignSelf: "flex-start",
            }}
          >
            Choose File (.glb):
          </label>
          <input
            type="file"
            id="fileUpload"
            onChange={handleFileChange}
            accept=".glb"
            style={{
              marginBottom: "20px",
              color: "#fff",
              fontSize: "16px",
            }}
          />

          {/* Upload Button */}
          <button
            type="submit"
            style={{
              backgroundColor: "#1DB954",
              color: "#fff",
              padding: "12px 25px",
              border: "none",
              borderRadius: "5px",
              fontSize: "18px",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#17a74a")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#1DB954")}
          >
            Upload Model
          </button>
        </form>

        {/* Display Upload Message */}
        {message && (
          <p
            style={{
              marginTop: "20px",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {message}
          </p>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ModelUploadPage;

