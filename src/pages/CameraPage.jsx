import React, { useRef, useEffect, useState } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { FaceMesh } from "@mediapipe/face_mesh";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CameraPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const camera3DRef = useRef(null);
  const glassesModelRef = useRef(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");

  // Fetch models from backend
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("http://localhost:5050/models");
        const data = await response.json();
        setModels(data);
        if (data.length > 0) setSelectedModel(data[0].model_file);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    fetchModels();
  }, []);

  // Initialize 3D scene and load model
  useEffect(() => {
    if (!canvasRef.current || !selectedModel) return;

    let scene = sceneRef.current;
    let renderer = rendererRef.current;
    let camera3D = camera3DRef.current;

    if (!scene) {
      scene = new THREE.Scene();
      sceneRef.current = scene;

      camera3D = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
      camera3D.position.set(0, 0, 5);
      camera3DRef.current = camera3D;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(800, 600);
      renderer.setClearColor(0x000000, 0);
      canvasRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 10, 7.5).normalize();
      scene.add(directionalLight);
    }

    const loader = new GLTFLoader();
    const modelUrl = `http://localhost:5050/models/${encodeURIComponent(selectedModel)}`;

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        // Normalize model size
        const boundingBox = new THREE.Box3().setFromObject(model);
        const size = boundingBox.getSize(new THREE.Vector3());
        const scaleFactor = 0.05 / Math.max(size.x, size.y, size.z);
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        scene.add(model);
        glassesModelRef.current = model;
      },
      undefined,
      (error) => console.error("Error loading 3D model:", error)
    );

    const animate = () => {
      requestAnimationFrame(animate);
      if (glassesModelRef.current) glassesModelRef.current.rotation.y += 0.01;
      renderer.render(scene, camera3D);
    };
    animate();
  }, [selectedModel]);

  // Initialize Mediapipe FaceMesh
  useEffect(() => {
    const initializeCamera = async () => {
      if (videoRef.current && canvasRef.current) {
        const faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results) => {
          if (!glassesModelRef.current) return;

          if (results.multiFaceLandmarks) {
            const landmarks = results.multiFaceLandmarks[0];

            const noseBridge = landmarks[6];
            const leftEye = landmarks[33];
            const rightEye = landmarks[263];

            if (noseBridge && leftEye && rightEye) {
              const positionX = (noseBridge.x - 0.5) * 10;
              const positionY = -(noseBridge.y - 0.5) * 10;
              glassesModelRef.current.position.set(positionX, positionY, 0);

              const eyeDistance = Math.sqrt(
                Math.pow(rightEye.x - leftEye.x, 2) +
                  Math.pow(rightEye.y - leftEye.y, 2)
              );
              glassesModelRef.current.scale.set(
                eyeDistance * 10,
                eyeDistance * 10,
                eyeDistance * 10
              );

              const angle = Math.atan2(
                rightEye.y - leftEye.y,
                rightEye.x - leftEye.x
              );
              glassesModelRef.current.rotation.set(0, 0, angle);
            }
          }
        });

        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            await faceMesh.send({ image: videoRef.current });
          },
          width: 800,
          height: 600,
        });

        camera.start();
      }
    };

    initializeCamera();
  }, []);

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
      <Header title="3D Glasses Try-on App" />
      <h1
        style={{
          color: "#fff",
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        Face Mesh with 3D Glasses
      </h1>

      <div style={{ marginBottom: "20px" }}>
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
          }}
        >
          {models.map((model) => (
            <option key={model.glasses_id} value={model.model_file}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "800px",
            height: "600px",
            border: "10px solid black",
            borderRadius: "8px",
            overflow: "hidden",
            position: "relative",
            backgroundColor: "#000",
          }}
        >
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            playsInline
          ></video>
          <canvas
            ref={canvasRef}
            width="800"
            height="600"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          ></canvas>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CameraPage;
