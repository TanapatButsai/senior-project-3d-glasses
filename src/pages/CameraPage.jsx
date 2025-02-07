import React, { useRef, useEffect, useState } from "react";
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
  const [faceDetected, setFaceDetected] = useState(false);

  let noFaceFrames = 0;
  const NO_FACE_THRESHOLD = 5; // Number of frames before hiding glasses
  const BASE_SCALE_MULTIPLIER = 5; // Base multiplier for scaling glasses
  const MIN_SCALE = 0.5; // Minimum scale for glasses
  const MAX_SCALE = 3.0; // Maximum scale for glasses
  const SMOOTH_FACTOR = 0.2; // Smooth interpolation factor (0.0 - 1.0)

  const loadGlassesModel = (scene) => {
    const loader = new GLTFLoader();
    loader.load(
      "/public/models/cartoon_glasses.glb", // Replace with actual model path
      (gltf) => {
        const glasses = gltf.scene;
        glassesRef.current = glasses;
        scene.add(glasses);
        glasses.visible = false; // Hide initially
      },
      undefined,
      (error) => {
        console.error("Failed to load model:", error);
      }
    );
  };

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera3D = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    camera3D.position.set(0, 0, 5);
    renderer.setSize(800, 600);
    renderer.setClearColor(0x000000, 0);
    canvasRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    camera3DRef.current = camera3D;
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5).normalize();
    scene.add(directionalLight);

    loadGlassesModel(scene);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera3D);
    };
    animate();
  }, []);

  useEffect(() => {
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
          minDetectionConfidence: 0.8,
          minTrackingConfidence: 0.8,
        });

        faceMesh.onResults((results) => {
          if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            noFaceFrames += 1;

            if (noFaceFrames >= NO_FACE_THRESHOLD) {
              glassesRef.current.visible = false; // Hide glasses
              setFaceDetected(false);
            }
            return;
          }

          // Reset frame counter when a face is detected
          noFaceFrames = 0;
          setFaceDetected(true);
          glassesRef.current.visible = true;

          const landmarks = results.multiFaceLandmarks[0];

          // **Key Landmarks**
          const leftEye = landmarks[33];
          const rightEye = landmarks[263];
          const noseBridge = landmarks[6];
          const leftEar = landmarks[234];
          const rightEar = landmarks[454];

          // **Calculate position and scaling**
          const midX = (leftEye.x + rightEye.x) / 2;
          const midY = (leftEye.y + rightEye.y) / 2;

          // **Face width (ear-to-ear distance) for scaling**
          const faceWidth = Math.sqrt(
            Math.pow(rightEar.x - leftEar.x, 2) +
            Math.pow(rightEar.y - leftEar.y, 2) +
            Math.pow(rightEar.z - leftEar.z, 2)
          );

          // Dynamically scale the glasses based on face distance
          let scale = faceWidth * BASE_SCALE_MULTIPLIER;
          scale = Math.max(MIN_SCALE, Math.min(scale, MAX_SCALE));

          // **Smoothly update scaling**
          const currentScale = glassesRef.current.scale.x;
          const newScale = THREE.MathUtils.lerp(currentScale, scale, SMOOTH_FACTOR);
          glassesRef.current.scale.set(newScale, newScale, newScale);

          // **Depth (Z position) for natural placement**
          const positionZ = -faceWidth * 2.2;

          // **Smoothly update position**
          const currentPosition = glassesRef.current.position;
          const targetPosition = {
            x: THREE.MathUtils.lerp(currentPosition.x, (midX - 0.5) * 10, SMOOTH_FACTOR),
            y: THREE.MathUtils.lerp(currentPosition.y, -(midY - 0.5) * 10, SMOOTH_FACTOR),
            z: THREE.MathUtils.lerp(currentPosition.z, positionZ, SMOOTH_FACTOR),
          };

          glassesRef.current.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
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
      <Header title="TRY-ME" />
      <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: "bold" }}>
        test
      </h1>

      {cameraError && (
        <p style={{ color: "red", fontWeight: "bold" }}>{cameraError}</p>
      )}

      {/* Face Detection Status */}
      <p style={{ color: faceDetected ? "green" : "red", fontWeight: "bold" }}>
        {faceDetected ? "Face Detected ✅" : "No Face Detected ❌ (Glasses Hidden)"}
      </p>

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
          playsInline></video>
        <div
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            zIndex: 2,
          }}></div>
      </div>

      <Footer />
    </div>
  );
};

export default CameraPage;
