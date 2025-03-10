import React, { useState } from "react";
import Navbar from "../components/Navbar"; // Import Navbar
import "./AdminPage.css"; // Import styles

const AdminPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle file upload (Mock function for now)
  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    // Here you would send the file to the backend
    console.log("Uploading:", selectedFile.name);
    alert(`File uploaded: ${selectedFile.name}`);
  };

  return (
    <div className="admin-container">
      <Navbar /> {/* Use the reusable Navbar */}

      <div className="admin-content">
        <h2>Admin Panel - Upload 3D Model</h2>

        <div className="upload-box">
          <input type="file" accept=".obj,.fbx,.gltf,.glb" onChange={handleFileChange} />
          <button onClick={handleUpload} className="upload-button">
            Upload Model
          </button>
        </div>

        {/* Display selected file name */}
        {selectedFile && (
          <p className="file-info">
            Selected File: <strong>{selectedFile.name}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
