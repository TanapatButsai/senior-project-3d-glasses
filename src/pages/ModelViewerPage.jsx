import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ModelViewerPage = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const modelRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");

  useEffect(() => {
    // Fetch models from backend
    const fetchModels = async () => {
      try {
        const response = await fetch("http://localhost:5050/models");
        const data = await response.json();

        setModels(data);
        if (data.length > 0) {
          setSelectedModel(data[0].model_file); // Default model
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    fetchModels();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !selectedModel) return;

    let scene = sceneRef.current;
    let renderer = rendererRef.current;
    let camera = cameraRef.current;

    if (!scene) {
      // ✅ Initialize Scene Only Once
      scene = new THREE.Scene();
      sceneRef.current = scene;

      camera = new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 1000);
      camera.position.set(0, 1, 5);
      cameraRef.current = camera;

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(640, 480);
      canvasRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 10, 7.5).normalize();
      scene.add(directionalLight);
    }

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/");
    loader.setDRACOLoader(dracoLoader);

    const loadModel = (modelName) => {
      if (modelRef.current) {
        scene.remove(modelRef.current);
        modelRef.current = null; // Clear reference
      }

      const modelUrl = `http://localhost:5050/models/${encodeURIComponent(modelName)}`;

      loader.load(
        modelUrl,
        (gltf) => {
          const model = gltf.scene;

          // Auto scale the model
          const boundingBox = new THREE.Box3().setFromObject(model);
          const size = boundingBox.getSize(new THREE.Vector3());
          const scaleFactor = 2 / Math.max(size.x, size.y, size.z);
          model.scale.set(scaleFactor, scaleFactor, scaleFactor);

          model.position.set(-boundingBox.getCenter(new THREE.Vector3()).x, -boundingBox.getCenter(new THREE.Vector3()).y, -boundingBox.getCenter(new THREE.Vector3()).z);

          scene.add(model);
          modelRef.current = model;
        },
        undefined,
        (error) => {
          console.error("Error loading 3D model:", error);
        }
      );
    };

    loadModel(selectedModel);

    const animate = () => {
      requestAnimationFrame(animate);
      if (modelRef.current) modelRef.current.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.setAnimationLoop(null);
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
              padding: "8px",
              fontSize: "16px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            {models.map((model) => (
              <option key={model.glasses_id} value={model.model_file}>
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
