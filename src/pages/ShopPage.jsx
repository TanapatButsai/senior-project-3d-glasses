import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import GlassesFilter from "../components/GlassesFilter";
import "./ShopPage.css";

const ShopPage = () => {
  const [models, setModels] = useState([]);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5050/models")
      .then((res) => res.json())
      .then((data) => setModels(data))
      .catch((error) => console.error("❌ Error fetching models:", error));
  }, []);

  const filteredModels = models.filter(
    (model) => filter === "all" || model.type === filter
  );

  return (
    <div className="shop-container">
      <Navbar />
      <GlassesFilter setFilter={setFilter} />
      <div className="grid-container">
        {filteredModels.map((model) => (
          <ModelCard key={model.glasses_id} model={model} navigate={navigate} />
        ))}
      </div>
    </div>
  );
};

const ModelCard = ({ model, navigate }) => {
  const containerRef = useRef(null);
  let scene, camera, renderer, modelObject;

  useEffect(() => {
    if (!containerRef.current) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(200, 200);
    containerRef.current.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    const modelURL = `http://localhost:5050/models/${model.model_file}`;

    loader.load(
      modelURL,
      (gltf) => {
        if (containerRef.current?.modelObject) {
          scene.remove(containerRef.current.modelObject);
        }

        modelObject = gltf.scene;
        modelObject.scale.set(2, 2, 2);
        modelObject.position.set(0, -0.5, 0);
        modelObject.rotation.set(0, 0, 0);

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
      if (renderer) {
        renderer.dispose();
        containerRef.current.innerHTML = "";
      }
    };
  }, [model.model_file]);

  // ✅ Animation Effects (Hover + Smooth Reset)
  const handleMouseEnter = () => {
    if (containerRef.current?.modelObject) {
      if (!containerRef.current.spinInterval) {
        containerRef.current.spinInterval = setInterval(() => {
          containerRef.current.modelObject.rotation.y += 0.05;
        }, 30);
      }
    }
  };

  const handleMouseLeave = () => {
    if (containerRef.current?.modelObject) {
      clearInterval(containerRef.current.spinInterval);
      containerRef.current.spinInterval = null;

      const targetRotation = 0;
      const animateReturn = () => {
        if (!containerRef.current?.modelObject) return;
        containerRef.current.modelObject.rotation.y = THREE.MathUtils.lerp(
          containerRef.current.modelObject.rotation.y,
          targetRotation,
          0.1
        );
        if (
          Math.abs(containerRef.current.modelObject.rotation.y - targetRotation) > 0.01
        ) {
          requestAnimationFrame(animateReturn);
        }
      };
      animateReturn();
    }
  };

  // ✅ ไปหน้า CameraPage พร้อมข้อมูลแว่น
  const handleTry = () => {
    navigate("/camera", { state: { selectedModel: model } });
  };

  return (
    <div className="model-card" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div ref={containerRef} className="model-view"></div>
      <p className="model-name">{model.name}</p>
      <button className="try-button" onClick={handleTry}>TRY</button>
    </div>
  );
};

export default ShopPage;
