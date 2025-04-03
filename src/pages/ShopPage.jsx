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
  const [user, setUser] = useState(null);
  const [userFavorites, setUserFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const containerRef = useRef(null);
  let scene, camera, renderer;
  let modelObject = null;


  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const userId = localStorage.getItem("user_id");
    if (storedUser && userId) {
      setUser(storedUser);
  
      fetch(`http://localhost:5050/favorites/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.favorites)) {
            setUserFavorites(data.favorites);
          } else {
            console.warn("⚠️ Unexpected favorites response:", data);
          }
        })
        
        .catch(err => console.error("❌ Failed to fetch favorites:", err));
    }
  }, []);
  
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser);

    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(model.glasses_id));
  }, [model.glasses_id]);

  useEffect(() => {
    if (!containerRef.current) return;

    const storedUser = localStorage.getItem("user");
    setUser(storedUser); // <-- NEW
    
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
        if (modelObject) {
          scene.remove(modelObject);
        }

        modelObject = gltf.scene;
        modelObject.scale.set(2, 2, 2);
        modelObject.position.set(0, -0.5, 0);
        modelObject.rotation.set(0, 0, 0);

        scene.add(modelObject);

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
      }
      if (scene) {
        while (scene.children.length > 0) {
          scene.remove(scene.children[0]);
        }
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [model.model_file]);


  const handleToggleFavorite = async (glasses_id) => {
    const user_id = localStorage.getItem("user_id"); // ✅ ดึง UUID ที่ถูกต้อง
  
    if (!user_id) {
      console.error("❌ No user_id found in localStorage.");
      return;
    }
  
    const isFav = userFavorites.includes(glasses_id);
  
    try {
      if (isFav) {
        await fetch(`http://localhost:5050/favorites`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id, glasses_id }),
        });
        setUserFavorites(prev => prev.filter(id => id !== glasses_id));
      } else {
        await fetch(`http://localhost:5050/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id, glasses_id }),
        });
        setUserFavorites(prev => [...prev, glasses_id]);
      }
    } catch (err) {
      console.error("❌ Favorite toggle failed:", err);
    }
  };
  
  
  
  // ✅ Hover Effects (Spin Animation) - Added Safeguard
  const handleMouseEnter = () => {
    if (!modelObject) return; // ✅ Ensure modelObject exists
    if (!containerRef.current.spinInterval) {
      containerRef.current.spinInterval = setInterval(() => {
        modelObject.rotation.y += 0.05;
      }, 30);
    }
  };

  const handleMouseLeave = () => {
    if (!modelObject) return; // ✅ Ensure modelObject exists
    clearInterval(containerRef.current.spinInterval);
    containerRef.current.spinInterval = null;

    const targetRotation = 0;
    const animateReturn = () => {
      if (!modelObject) return;
      modelObject.rotation.y = THREE.MathUtils.lerp(
        modelObject.rotation.y,
        targetRotation,
        0.1
      );
      if (Math.abs(modelObject.rotation.y - targetRotation) > 0.01) {
        requestAnimationFrame(animateReturn);
      }
    };
    animateReturn();
  };

  // ✅ Navigate to CameraPage with glasses_id only
// ✅ Navigate to CameraPage with full model data
const handleTry = async () => {
  if (!model) {
    console.error("❌ No model data available to send!");
    alert("Error: Model data is missing. Please try again.");
    return;
  }

  console.log("📌 Sending model:", model);

  // ✅ อัปเดต try_count ใน Database
  try {
    const response = await fetch(`http://localhost:5050/models/increment-try/${model.glasses_id}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to update try count");
    }

    const data = await response.json();
    console.log("✅ Updated try_count:", data.try_count);
  } catch (error) {
    console.error("❌ Error updating try_count:", error);
  }

  // ✅ ส่งไปที่ Camera Page
  navigate("/camera", { state: { selectedModel: model } });
};
// const isFavorite = userFavorites.includes(model.glasses_id);



return (
    <div
      className="model-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {user && (
        <button
          className="favorite-icon"
          onClick={() => handleToggleFavorite(model.glasses_id)}
        >
          {userFavorites.includes(model.glasses_id) ? "❤️" : "🖤"}
        </button>
      )}

      <div ref={containerRef} className="model-view"></div>
      <p className="model-name">{model.name}</p>
      <button className="try-button" onClick={handleTry}>
        TRY
      </button>
    </div>
  );
};

export default ShopPage;
