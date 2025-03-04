import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ModelUploadPage = () => {
  const [modelName, setModelName] = useState("");
  const [modelType, setModelType] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleNameChange = (e) => setModelName(e.target.value);
  const handleTypeChange = (e) => setModelType(e.target.value);
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!modelName || !modelType || !file) {
      setMessage("All fields are required: Model name, type, and file.");
      setShowModal(true);
      return;
    }

    const formData = new FormData();
    formData.append("modelName", modelName);
    formData.append("type", modelType);
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5050/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Model uploaded successfully!");
        setModelName("");
        setModelType("");
        setFile(null);
      } else {
        setMessage(result.message || "Failed to upload model.");
      }
    } catch (error) {
      console.error("Error uploading model:", error);
      setMessage("An error occurred while uploading the model.");
    } finally {
      setShowModal(true); // Show the modal with the result
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#326a72",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <Header title="Upload 3D Glasses Model" />

      <div
        style={{
          flexGrow: 1,
          display: "flex",
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
            padding: "20px",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          <label
            htmlFor="modelName"
            style={{ color: "#000", marginBottom: "5px", fontWeight: "bold" }}
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
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

          <label
            htmlFor="modelType"
            style={{ color: "#000", marginBottom: "5px", fontWeight: "bold" }}
          >
            Model Type:
          </label>
          <select
            id="modelType"
            value={modelType}
            onChange={handleTypeChange}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">Select Type</option>
            <option value="Sunglasses">Sunglasses</option>
            <option value="Prescription Glasses">
              Prescription Glasses
            </option>
          </select>

          <label
            htmlFor="fileUpload"
            style={{ color: "#000", marginBottom: "5px", fontWeight: "bold" }}
          >
            Choose File:
          </label>
          <input
            type="file"
            id="fileUpload"
            onChange={handleFileChange}
            accept=".glb"
            style={{ marginBottom: "10px", padding: "10px", width: "100%" }}
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

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "400px",
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 style={{ color: "#333" }}>Status</h2>
            <p style={{ margin: "20px 0", color: "#555" }}>{message}</p>
            <button
              onClick={() => setShowModal(false)}
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
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ModelUploadPage;
