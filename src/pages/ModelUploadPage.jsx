import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "./ModelUploadPage.css";

const ModelUploadPage = () => {
  const [modelName, setModelName] = useState("");
  const [modelType, setModelType] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleNameChange = (e) => setModelName(e.target.value);
  const handleTypeChange = (e) => setModelType(e.target.value);
  
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];

    // ✅ Allow only .glb files
    if (uploadedFile && uploadedFile.name.split('.').pop().toLowerCase() !== "glb") {
      setMessage("Only .glb files are allowed!");
      setFile(null);
      setFileName("No file chosen");
      setShowSuccessModal(true);
      return;
    }

    setFile(uploadedFile);
    setFileName(uploadedFile ? uploadedFile.name : "No file chosen");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!modelName || !modelType || !file) {
      setMessage("All fields are required: Model name, type, and file.");
      setShowSuccessModal(true);
      return;
    }

    // ✅ Extra file validation before showing confirm modal
    if (file.name.split('.').pop().toLowerCase() !== "glb") {
      setMessage("Invalid file type! Please select a .glb file.");
      setShowSuccessModal(true);
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmUpload = async () => {
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
        setFileName("No file chosen");
      } else {
        setMessage(result.message || "Failed to upload model.");
      }
    } catch (error) {
      console.error("Error uploading model:", error);
      setMessage("An error occurred while uploading the model.");
    } finally {
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    }
  };

  return (
    <div className="upload-container">
      <Navbar />

      <div className="upload-form-container">
        <form onSubmit={handleSubmit} className="upload-form">
          <label htmlFor="modelName" className="form-label">Model Name:</label>
          <input
            type="text"
            id="modelName"
            value={modelName}
            onChange={handleNameChange}
            placeholder="Enter Model Name"
            className="form-input"
          />

          <label htmlFor="modelType" className="form-label">Model Type:</label>
          <select id="modelType" value={modelType} onChange={handleTypeChange} className="form-input">
            <option value="">Select Type</option>
            <option value="Sunglasses">Sunglasses</option>
            <option value="Prescription Glasses">Prescription Glasses</option>
          </select>

          <label htmlFor="fileUpload" className="form-label">Choose File:</label>
          <input
            type="file"
            id="fileUpload"
            onChange={handleFileChange}
            accept=".glb"
            className="form-input file-input"
          />
          <p className="file-name">Selected File: {fileName}</p>

          <button type="submit" className="upload-button small-button">Upload</button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Confirm Upload</h2>
            <p className="modal-text"><strong>Model Name:</strong> <span className="red-text">{modelName}</span></p>
            <p className="modal-text"><strong>Model Type:</strong> <span className="red-text">{modelType}</span></p>
            <p className="modal-text"><strong>File:</strong> <span className="red-text">{fileName}</span></p>
            <div className="modal-buttons">
              <button onClick={confirmUpload} className="confirm-button">Confirm</button>
              <button onClick={() => setShowConfirmModal(false)} className="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Status</h2>
            <p>{message}</p>
            <button onClick={() => setShowSuccessModal(false)} className="upload-button">
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
