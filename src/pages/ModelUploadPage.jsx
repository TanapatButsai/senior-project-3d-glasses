import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import NavbarAdmin from "../components/NavbarAdmin";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "./ModelUploadPage.css";

const ModelUploadPage = () => {
  const [modelName, setModelName] = useState("");
  const [modelType, setModelType] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const modelViewerRef = useRef(null);
  const threeSceneRef = useRef(null);

  const handleNameChange = (e) => setModelName(e.target.value);
  const handleTypeChange = (e) => setModelType(e.target.value);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];

    // ✅ Only accept .glb files
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

    // ✅ Extra validation before showing confirm modal
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

  // **3D Model Viewer Setup**
  useEffect(() => {
    if (showConfirmModal && file) {
      if (!modelViewerRef.current) return; // ✅ Prevent null reference

      // Cleanup existing Three.js scene
      if (threeSceneRef.current) {
        threeSceneRef.current.dispose();
        modelViewerRef.current.innerHTML = "";
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      camera.position.z = 2;

      const renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(200, 200);
      modelViewerRef.current.appendChild(renderer.domElement);
      threeSceneRef.current = renderer;

      const loader = new GLTFLoader();
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (event) {
        loader.load(
          event.target.result,
          (gltf) => {
            const model = gltf.scene;
            model.scale.set(0.8, 0.8, 0.8);
            scene.add(model);

            const animate = function () {
              requestAnimationFrame(animate);
              model.rotation.y += 0.01; // Spin the model
              renderer.render(scene, camera);
            };
            animate();
          },
          undefined,
          (error) => {
            console.error("Error loading 3D model:", error);
          }
        );
      };

      return () => {
        if (threeSceneRef.current) {
          threeSceneRef.current.dispose();
          threeSceneRef.current = null;
        }
      };
    }
  }, [showConfirmModal, file]);

  return (
    <div className="upload-container">
      <NavbarAdmin/>

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
            
            {/* 3D Model Viewer */}
            <div className="model-viewer" ref={modelViewerRef}></div>

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

      <Footer />
    </div>
  );
};

export default ModelUploadPage;
