import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "./ShopPage.css";
import Navbar from "../components/Navbar";
import { div } from "framer-motion/client";

const ShopPage = () => {
  const [models, setModels] = useState([]);

  // ✅ Fetch models from backend
  useEffect(() => {
    fetch("http://localhost:5050/models")
      .then((res) => res.json())
      .then((data) => setModels(data))
      .catch((error) => console.error("❌ Error fetching models:", error));
  }, []);

  return (
    <div className="shop-container">
      <h1>3D Glasses Shop</h1>
      <div className="grid-container">
        {models.map((model) => (
          <ModelCard key={model.glasses_id} model={model} />
        ))}
      </div>
    </div>
  );
};

const ModelCard = ({ model }) => {
  const containerRef = useRef(null);
  let scene, camera, renderer, modelObject;

  useEffect(() => {
    if (!containerRef.current) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 3;

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(150, 150);
    containerRef.current.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    const modelURL = `http://localhost:5050/models/${model.model_file}`; // ✅ Absolute path

    console.log("📌 Loading model:", modelURL);

    loader.load(
      modelURL,
      (gltf) => {
        modelObject = gltf.scene;
        modelObject.scale.set(1.5, 1.5, 1.5);
        modelObject.rotation.set(0, Math.PI, 0); // ✅ Default front view
        scene.add(modelObject);

        containerRef.current.modelObject = modelObject;

        const animate = () => {
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
        };
        animate();
      },
      undefined,
      (error) => {
        console.error("❌ Model Load Error:", error);
        containerRef.current.innerHTML = `<p style="color:red;">Failed to load model</p>`;
      }
    );

    return () => {
      console.log("🛠 Cleaning up WebGL Renderer");
      if (renderer) {
        renderer.dispose();
        containerRef.current.innerHTML = "";
      }
    };
  }, [model.model_file]);

  // ✅ Hover Effects (Spin Animation)
  const handleMouseEnter = () => {
    if (containerRef.current?.modelObject) {
      containerRef.current.spinInterval = setInterval(() => {
        containerRef.current.modelObject.rotation.y += 0.05;
      }, 30);
    }
  };

  const handleMouseLeave = () => {
    if (containerRef.current?.modelObject) {
      clearInterval(containerRef.current.spinInterval);
      containerRef.current.modelObject.rotation.y = Math.PI;
    }
  };

  return (
    <div>
      <div><Navbar/></div>
      <div className="model-card" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div ref={containerRef} className="model-view"></div>
        <p className="model-name">{model.name}</p>
      </div>
    </div>
    
  );
};

export default ShopPage;