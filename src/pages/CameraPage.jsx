import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CameraPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const camera3DRef = useRef(null);
  const glassesRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);

  const loadGlassesModel = (scene) => {
    const loader = new GLTFLoader();
    loader.load(
      "/public/models/cartoon_glasses.glb", // Replace with your actual .glb file path
      (gltf) => {
        const glasses = gltf.scene;
        glasses.scale.set(0.05, 0.05, 0.05); // Adjust scale
        scene.add(glasses);
        glassesRef.current = glasses;
      },
      undefined,
      (error) => {
        console.error("Failed to load model:", error);
      }
    );
  };

  useEffect(() => {
    // Initialize 3D Scene
    const scene = new THREE.Scene();
    const camera3D = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    camera3D.position.set(0, 0, 5);
    renderer.setSize(800, 600);
    renderer.setClearColor(0x000000, 0); // Transparent background
    canvasRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    camera3DRef.current = camera3D;
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5).normalize();
    scene.add(directionalLight);

    // Load Glasses Model
    loadGlassesModel(scene);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera3D);
    };
    animate();
  }, []);

  useEffect(() => {
    // Setup Camera and FaceMesh
    const checkCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

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
          if (results.multiFaceLandmarks && glassesRef.current) {
            const landmarks = results.multiFaceLandmarks[0];
            const noseBridge = landmarks[6]; // Example landmark for positioning glasses

            // Map landmarks to 3D coordinates
            const x = (noseBridge.x - 0.5) * 10; // Adjust scaling as needed
            const y = -(noseBridge.y - 0.5) * 10;
            const z = -5; // Fixed depth for now
            glassesRef.current.position.set(x, y, z);
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
      } catch (error) {
        console.error("Camera access error:", error);
        setCameraError("Camera not accessible. Please check permissions.");
      }
    };

    checkCameraAccess();
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
      <Header title="AR Face Filter with .glb Models" />
      <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: "bold" }}>
        3D AR Face Filter
      </h1>

      {cameraError && (
        <p style={{ color: "red", fontWeight: "bold" }}>{cameraError}</p>
      )}

      {/* Video and Canvas */}
      <div style={{ position: "relative", width: "800px", height: "600px" }}>
        <video
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            zIndex: 1,
          }}
          playsInline
        ></video>
        <div
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            zIndex: 2,
          }}
        ></div>
      </div>

      <Footer />
    </div>
  );
};

export default CameraPage;
