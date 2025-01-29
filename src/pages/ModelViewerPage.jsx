import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ModelViewerPage = () => {
  const canvasRef = useRef(null);
  const [models, setModels] = useState([]); // Store models from backend
  const [selectedModel, setSelectedModel] = useState(""); // Selected model
  let scene, camera, renderer, model;

  useEffect(() => {
    // Fetch models from backend
    const fetchModels = async () => {
      try {
        const response = await fetch("http://localhost:5050/models");
        const data = await response.json();
        setModels(data);

        if (data.length > 0) {
          setSelectedModel(data[0].file_path); // Default to first model
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    fetchModels();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !selectedModel) return;

    // Three.js scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 1000);
    camera.position.set(0, 1, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(640, 480);
    canvasRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5).normalize();
    scene.add(directionalLight);

    const loader = new GLTFLoader();

    const loadModel = (modelUrl) => {
      if (model) scene.remove(model);

      loader.load(
        modelUrl,
        (gltf) => {
          model = gltf.scene;

          // Scale and center model
          const boundingBox = new THREE.Box3().setFromObject(model);
          const size = boundingBox.getSize(new THREE.Vector3());
          const center = boundingBox.getCenter(new THREE.Vector3());
          const scaleFactor = 2 / Math.max(size.x, size.y, size.z);
          model.scale.set(scaleFactor, scaleFactor, scaleFactor);
          model.position.set(-center.x, -center.y, -center.z);

          scene.add(model);
        },
        undefined,
        (error) => console.error("Error loading 3D model:", error)
      );
    };

    loadModel(`http://localhost:5050/models/${selectedModel}`);

    const animate = () => {
      requestAnimationFrame(animate);
      if (model) model.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      if (canvasRef.current) canvasRef.current.innerHTML = "";
    };
  }, [selectedModel]);

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
      <Header title="3D Glasses Model Viewer" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          width: "100%",
          padding: "20px",
        }}
      >
        {/* Dropdown for Selecting Models */}
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <label
            htmlFor="modelSelect"
            style={{
              color: "#fff",
              fontSize: "18px",
              marginRight: "10px",
              fontWeight: "bold",
            }}
          >
            Select Glasses Model:
          </label>
          <select
            id="modelSelect"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              padding: "10px",
              fontSize: "16px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
            }}
          >
            {models.map((model) => (
              <option key={model.file_path} value={model.file_path}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3D Model Viewer */}
        <div
          ref={canvasRef}
          style={{
            width: "640px",
            height: "480px",
            border: "2px solid #1DB954",
            borderRadius: "8px",
            backgroundColor: "#000",
          }}
        />
      </div>
      <Footer />
    </div>
  );
};

export default ModelViewerPage;
