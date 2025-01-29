import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ModelUploadPage = () => {
  const [modelName, setModelName] = useState("");
  const [modelType, setModelType] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleNameChange = (e) => setModelName(e.target.value);
  const handleTypeChange = (e) => setModelType(e.target.value);
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!modelName || !modelType || !file) {
      setMessage("All fields are required: Model name, type, and file.");
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
      }}>
      
      {/* ✅ Header now takes only necessary space */}
      <Header title="Upload 3D Glasses Model" />

      {/* ✅ Add `flex-grow` to push content below the header */}
      <div style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
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
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)"
          }}>
          
          <label htmlFor="modelName" style={{ color: "#000", marginBottom: "5px", fontWeight: "bold" }}>Model Name:</label>
          <input type="text" id="modelName" value={modelName} onChange={handleNameChange} placeholder="Enter Model Name" 
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

          <label htmlFor="modelType" style={{ color: "#000", marginBottom: "5px", fontWeight: "bold" }}>Model Type:</label>
          <select id="modelType" value={modelType} onChange={handleTypeChange} 
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}>
            <option value="">Select Type</option>
            <option value="Sunglasses">Sunglasses</option>
            <option value="Prescription Glasses">Prescription Glasses</option>
          </select>

          <label htmlFor="fileUpload" style={{ color: "#000", marginBottom: "5px", fontWeight: "bold" }}>Choose File:</label>
          <input type="file" id="fileUpload" onChange={handleFileChange} accept=".glb" 
            style={{ marginBottom: "10px", padding: "10px", width: "100%" }} />

          <button type="submit" 
            style={{ 
              backgroundColor: "#1DB954", color: "#fff", padding: "10px 20px", 
              border: "none", borderRadius: "5px", fontSize: "16px", cursor: "pointer" 
            }}>
            Upload
          </button>
        </form>
      </div>

      {/* ✅ Message Below the Form */}
      {message && <p style={{ marginTop: "10px", color: "#fff", fontWeight: "bold" }}>{message}</p>}

      {/* ✅ Footer always at the bottom */}
      <Footer />
    </div>
  );
};

export default ModelUploadPage;
