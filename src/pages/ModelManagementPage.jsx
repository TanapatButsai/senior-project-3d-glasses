import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Navbar from "../components/Navbar";
import axios from "axios";
import "./ModelManagementPage.css"; // ✅ ใช้ CSS แยกเพื่อไม่ให้มีผลกับหน้าอื่น

const ModelManagementPage = () => {
  const [models, setModels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const modelsPerPage = 7; // ✅ กำหนดให้แสดงแค่ 7 โมเดลต่อหน้า

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await fetch("http://localhost:5050/models");
      const data = await res.json();
      setModels(data);
    } catch (error) {
      console.error("❌ Error fetching models:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this model?")) return;

    try {
      await axios.delete(`http://localhost:5050/models/${id}`);
      setModels(models.filter((model) => model.glasses_id !== id));
    } catch (error) {
      console.error("❌ Error deleting model:", error);
    }
  };

  // ✅ คำนวณ Index ของโมเดลในหน้านั้น ๆ
  const indexOfLastModel = currentPage * modelsPerPage;
  const indexOfFirstModel = indexOfLastModel - modelsPerPage;
  const currentModels = models.slice(indexOfFirstModel, indexOfLastModel);

  return (
    <div className="model-management-container">
      <Navbar />
      <h1>Model Management</h1>
      <div className="model-management-list">
        {currentModels.map((model) => (
          <ModelCard key={model.glasses_id} model={model} onDelete={handleDelete} />
        ))}
      </div>

      {/* ✅ Pagination Controls */}
      <div className="pagination">
        <button
          className="pagination-button"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          className="pagination-button"
          onClick={() =>
            setCurrentPage((prev) => (indexOfLastModel < models.length ? prev + 1 : prev))
          }
          disabled={indexOfLastModel >= models.length}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const ModelCard = ({ model, onDelete }) => {
  const containerRef = useRef(null);
  let scene, camera, renderer, modelObject;

  useEffect(() => {
    if (!containerRef.current) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(250, 250);
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
        if (containerRef.current) {
          containerRef.current.innerHTML = `<p style="color:red;">Failed to load model</p>`;
        }
      }
    );

    return () => {
      if (renderer) {
        renderer.dispose();
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
      }
    };
  }, [model.model_file]);

  // ✅ Hover Effects (Spin Animation)
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

  return (
    <div className="model-management-card">
      <div
        ref={containerRef}
        className="model-management-view"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      ></div>
      <div className="model-management-info">
        <h3>{model.name}</h3>
        <p><strong>Type:</strong> {model.type}</p>
        <p><strong>Try Count:</strong> {model.try_count}</p>
        <button className="edit-button">Edit</button>
        <button className="delete-button" onClick={() => onDelete(model.glasses_id)}>Delete</button>
      </div>
    </div>
  );
};

export default ModelManagementPage;
