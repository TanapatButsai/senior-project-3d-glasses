import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ModelViewerPage = () => {
  const canvasRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState("model1.glb"); // Default model

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create a Three.js scene
    const scene = new THREE.Scene();

    // Set up a camera
    const camera = new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 1000);
    camera.position.z = 5;

    // Set up a renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(640, 480);
    canvasRef.current.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5).normalize();
    scene.add(directionalLight);

    let model;
    const loader = new GLTFLoader();

    const loadModel = (modelName) => {
      if (model) {
        scene.remove(model); // Remove the previous model
      }

      loader.load(
        `/models/${modelName}`, // Dynamic path based on selected model
        (gltf) => {
          model = gltf.scene;

          // Scale and position the model
          const boundingBox = new THREE.Box3().setFromObject(model);
          const size = boundingBox.getSize(new THREE.Vector3());
          const center = boundingBox.getCenter(new THREE.Vector3());
          const scaleFactor = 2 / Math.max(size.x, size.y, size.z);
          model.scale.set(scaleFactor, scaleFactor, scaleFactor);
          model.position.set(-center.x, -center.y, -center.z);

          scene.add(model);
        },
        undefined,
        (error) => {
          console.error("Error loading 3D model:", error);
        }
      );
    };

    // Load the default model
    loadModel(selectedModel);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Optional: Rotate the model
      if (model) {
        model.rotation.y += 0.01;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on component unmount
    return () => {
      renderer.dispose();
      if (canvasRef.current) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, [selectedModel]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#326a72",
      }}
    >
      <Header title="3D Glasses Model Viewer" />
      <div>
        <label htmlFor="modelSelect" style={{ color: "#fff", marginRight: "10px" }}>
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
          }}
        >
          <option value="apple_ar_glasses_concept_art.glb">apple_ar_glasses_concept_art.glb</option>
          <option value="cartoon_glasses.glb">cartoon_glasses.glb</option>
          <option value="glasses.glb">glasses.glb</option>
        </select>
      </div>
      <div
        ref={canvasRef}
        style={{
          width: "640px",
          height: "480px",
          border: "2px solid #1DB954",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      />
      <Footer />
    </div>
  );
};

export default ModelViewerPage;
